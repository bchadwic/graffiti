package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type CellMessage struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

type Cell struct {
	UUID  string `json:"uuid"`
	Id    int    `json:"id"`
	Key   byte   `json:"key"`
	Red   byte   `json:"red"`
	Green byte   `json:"green"`
	Blue  byte   `json:"blue"`
}

var cells = make([]Cell, 900)

func main() {
	for i := range cells {
		cells[i] = Cell{
			Id:    i,
			Key:   160,
			Red:   20,
			Green: 20,
			Blue:  20,
		}
	}
	go run()
	http.Handle("/", http.FileServer(http.Dir("./")))
	http.HandleFunc("/ws", ws)
	http.ListenAndServe(":8080", nil)
}

var upgrader = websocket.Upgrader{}

func ws(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()

	message := map[string]any{"type": "load", "data": cells}
	jsonMessage, _ := json.Marshal(message)
	err = c.WriteMessage(websocket.TextMessage, jsonMessage)
	if err != nil {
		log.Println("write:", err)
		return
	}

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Println(string(message))
		cell := Cell{}
		err = json.Unmarshal(message, &cell)
		if err != nil {
			log.Println("read:", err)
			break
		}
		cells[cell.Id] = cell
		fmt.Printf("%v\n", cell)
		update := map[string]any{"type": "update", "data": cell}
		jsonMessage, _ = json.Marshal(update)
		err = c.WriteMessage(mt, jsonMessage)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

var broadcast = make(chan *CellMessage)
var register = make(chan *User)
var unregister = make(chan *User)
var users = map[*User]bool{}

type User struct {
	UUID string `json:"uuid"`
	conn *websocket.Conn
	send chan *CellMessage
}

func run() {
	for {
		select {
		case user := <-register:
			fmt.Println(users)
			users[user] = true
		case _ = <-unregister:
			// if _, ok := users[user]; ok {
			// 	delete(users, user)
			// 	close(user.send)
			// }
		case message := <-broadcast:
			for user := range users {
				select {
				case user.send <- message:
					// default:
					// 	close(user.send)
					// 	delete(users, user)
				}
			}
		}
	}
}

func wss(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	user := &User{conn: conn}
	register <- user

	go user.read()
	go user.write()
}

func (user *User) read() {
	// defer func() {
	// 	unregister <- user
	// 	user.conn.Close()
	// }()

	for {
		_, raw, err := user.conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Println(string(raw))
		cell := Cell{}
		err = json.Unmarshal(raw, &cell)
		if err != nil {
			log.Println("read:", err)
			break
		}
		if user.UUID == "" {
			user.UUID = cell.UUID
		}
		cells[cell.Id] = cell
		fmt.Printf("%v\n", cell)
		update := &CellMessage{Type: "update", Data: cell}
		broadcast <- update
	}
}

func (user *User) write() {
	ticker := time.NewTicker(10)
	// defer func() {
	// 	user.conn.Close()
	// }()
	for {
		select {
		case message, ok := <-user.send:
			if !ok {
				user.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := user.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			encoder := json.NewEncoder(w)
			encoder.Encode(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			user.conn.SetWriteDeadline(time.Now().Add(10))
			if err := user.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

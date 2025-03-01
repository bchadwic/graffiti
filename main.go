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

	strs := make(chan string)

	go func() {
		for {
			fmt.Println("here I am")
			select {
			case s := <-strs:
				fmt.Println(s)
			}
		}
	}()

	time.Sleep(30 * time.Second)
	strs <- "hello"

	// for i := range cells {
	// 	cells[i] = Cell{
	// 		Id:    i,
	// 		Key:   160,
	// 		Red:   20,
	// 		Green: 20,
	// 		Blue:  20,
	// 	}
	// }
	// http.Handle("/", http.FileServer(http.Dir("./")))
	// http.HandleFunc("/ws", ws)
	// http.ListenAndServe(":8080", nil)
}

var upgrader = websocket.Upgrader{}

func ws(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer conn.Close()

	message := map[string]any{"type": "load", "data": cells}
	jsonMessage, _ := json.Marshal(message)
	err = conn.WriteMessage(websocket.TextMessage, jsonMessage)
	if err != nil {
		log.Println("write:", err)
		return
	}

	for {
		mt, message, err := conn.ReadMessage()
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
		err = conn.WriteMessage(mt, jsonMessage)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

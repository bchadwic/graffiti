package main

import (
	"log"
	"net/http"

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
	server := &Server{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *CellMessage),
		registry:   make(map[*Client]bool),
	}
	go server.run()
	http.Handle("/", http.FileServer(http.Dir("./")))
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws(server, w, r)
	})
	http.ListenAndServe(":8080", nil)
}

var upgrader = websocket.Upgrader{}

func ws(server *Server, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	uuid := r.URL.Query().Get("uuid")
	client := &Client{uuid: uuid, conn: conn, server: server, send: make(chan *CellMessage)}
	client.server.register <- client

	client.conn.WriteJSON(&CellMessage{Type: "load", Data: cells})

	go client.writePump()
	go client.readUpdated()
}

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	WRITE_TIMEOUT = 10 * time.Second
	READ_LIMIT    = 512
)

type Client struct {
	uuid   string
	conn   *websocket.Conn
	send   chan *CellMessage
	server *Server
}

func (client *Client) readUpdated() {
	defer func() {
		fmt.Println("read closed")
		client.server.unregister <- client
		client.conn.Close()
	}()

	client.conn.SetReadLimit(READ_LIMIT)
	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		cell := Cell{}
		err = json.Unmarshal(message, &cell)
		if err != nil {
			log.Printf("error: %v", err)
			continue
		}
		cells[cell.Id] = cell
		client.server.broadcast <- &CellMessage{Type: "update", Data: cell}
	}
}

func (client *Client) writePump() {
	defer func() {
		fmt.Println("write closed")
		client.conn.Close()
	}()

	for {
		select {
		case message := <-client.send:
			// client.conn.SetWriteDeadline(time.Now().Add(WRITE_TIMEOUT))
			// if !ok {
			// 	client.conn.WriteMessage(websocket.CloseMessage, []byte{})
			// 	return
			// }
			w, err := client.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				fmt.Printf("err: %v\n", err)
				return
			}
			cell := message.Data.(Cell)
			log.Printf("write: uuid: %s, id:%d, key:%c", client.uuid, cell.Id, cell.Key)
			encoder := json.NewEncoder(w)
			encoder.Encode(message)
			w.Close()
		}
	}
}

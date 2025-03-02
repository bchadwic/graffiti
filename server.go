package main

import "log"

type Server struct {
	register   chan *Client
	unregister chan *Client
	broadcast  chan *CellMessage
	registry   map[*Client]bool
}

func (server *Server) run() {
	for {
		select {
		case client := <-server.register:
			log.Printf("registering uuid: %s\n", client.uuid)
			server.registry[client] = true
		case client := <-server.unregister:
			log.Printf("unregistering uuid: %s\n", client.uuid)
			if _, ok := server.registry[client]; ok {
				log.Printf("found client removing from registry uuid: %s\n", client.uuid)
				delete(server.registry, client)
				close(client.send)
			}
		case message := <-server.broadcast:
			cell := message.Data.(Cell)
			log.Printf("broadcasting: index:%d, key:%c\n", cell.Id, cell.Key)
			for client := range server.registry {
				select {
				case client.send <- message:
				default:
					log.Printf("unregistering uuid: %s\n", client.uuid)
					close(client.send)
					delete(server.registry, client)
				}
			}
		}
	}
}

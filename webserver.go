package main

import (
	"log"
	"net"
	"net/http"
	"strings"
)

func main() {
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", fs)

	addrs, err := net.InterfaceAddrs()
	if err != nil {
		log.Print("Listening on :3000...")
	} else {
		log.Println("site can be reached on any network interface and port 3000:")
		for _, addr := range addrs {

			log.Print("http://", strings.Split(addr.String(), "/")[0], ":3000")
		}
	}

	panic(http.ListenAndServe(":3000", nil))

}

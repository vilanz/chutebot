package chutebot

import (
	"log"
	"os"
	"os/signal"
	"syscall"
)

func PanicOnErr(message string, err error, v ...any) {
	if err != nil {
		log.Panicf(message, err, v)
	}
}

func LogOnErr(message string, err error, v ...any) {
	if err != nil {
		log.Panicf(message, err, v)
	}
}

func NotifyOnKill() chan os.Signal {
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)
	return ch
}

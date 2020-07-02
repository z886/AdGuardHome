package home

import (
	"bytes"
	"encoding/binary"
	"io/ioutil"
	"os"
	"time"
	"unsafe"

	"github.com/AdguardTeam/golibs/log"
)

const glTokenTimeoutSeconds = 3600
const glCookieName = "Admin-Token"

func glCheckToken(sess string) bool {
	tokenName := "/tmp/gl_token_" + sess
	_, err := os.Stat(tokenName)
	if err != nil {
		log.Error("os.Stat: %s", err)
		return false
	}
	tokenDate := glGetTokenDate(tokenName)
	now := uint32(time.Now().UTC().Unix())
	return now <= (tokenDate + glTokenTimeoutSeconds)
}

func archIsLittleEndian() bool {
	var i int32 = 0x01020304
	u := unsafe.Pointer(&i)
	pb := (*byte)(u)
	b := *pb
	return (b == 0x04)
}

func glGetTokenDate(file string) uint32 {
	f, err := os.Open(file)
	if err != nil {
		log.Error("os.Open: %s", err)
		return 0
	}
	var dateToken uint32
	bs, err := ioutil.ReadAll(f)
	if err != nil {
		log.Error("ioutil.ReadAll: %s", err)
		return 0
	}
	buf := bytes.NewBuffer(bs)

	if archIsLittleEndian() {
		err := binary.Read(buf, binary.LittleEndian, &dateToken)
		if err != nil {
			log.Error("binary.Read: %s", err)
			return 0
		}
	} else {
		err := binary.Read(buf, binary.BigEndian, &dateToken)
		if err != nil {
			log.Error("binary.Read: %s", err)
			return 0
		}
	}
	return dateToken
}

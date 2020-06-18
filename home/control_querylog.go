package home

import (
	"encoding/json"
	"net/http"

	"github.com/AdguardTeam/AdGuardHome/querylog"
	"github.com/AdguardTeam/golibs/jsonutil"
)

func registerQuerylogHandlers() {
	httpRegister("GET", "/control/querylog_info", handleQueryLogInfo)
	httpRegister("POST", "/control/querylog_clear", handleQueryLogClear)
	httpRegister("POST", "/control/querylog_config", handleQueryLogConfig)
}

func handleQueryLogClear(_ http.ResponseWriter, _ *http.Request) {
	Context.queryLog.Clear()
}

type qlogConfigJSON struct {
	Enabled           bool   `json:"enabled"`
	Interval          uint32 `json:"interval"`
	AnonymizeClientIP bool   `json:"anonymize_client_ip"`
}

// Get configuration
func handleQueryLogInfo(w http.ResponseWriter, r *http.Request) {
	conf := querylog.Config{}
	Context.queryLog.GetConfig(&conf)

	resp := qlogConfigJSON{}
	resp.Enabled = conf.Enabled
	resp.Interval = conf.Interval
	resp.AnonymizeClientIP = conf.AnonymizeClientIP

	jsonVal, err := json.Marshal(resp)
	if err != nil {
		httpError2(r, w, http.StatusInternalServerError, "json encode: %s", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonVal)
	if err != nil {
		httpError2(r, w, http.StatusInternalServerError, "http write: %s", err)
	}
}

// Set configuration
func handleQueryLogConfig(w http.ResponseWriter, r *http.Request) {
	d := qlogConfigJSON{}
	req, err := jsonutil.DecodeObject(&d, r.Body)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "%s", err)
		return
	}

	config.Lock()
	conf := querylog.Config{}
	Context.queryLog.GetConfig(&conf)
	if req.Exists("enabled") {
		conf.Enabled = d.Enabled
	}
	if req.Exists("interval") {
		conf.Interval = d.Interval
	}
	if req.Exists("anonymize_client_ip") {
		conf.AnonymizeClientIP = d.AnonymizeClientIP
	}
	err = Context.queryLog.SetConfig(conf)
	config.Unlock()
	if err != nil {
		httpError2(r, w, http.StatusInternalServerError, "queryLog.SetConfig: %s", err)
		return
	}

	onConfigModified()
}

package home

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/AdguardTeam/AdGuardHome/dhcpd"
	"github.com/AdguardTeam/AdGuardHome/util"

	"github.com/AdguardTeam/golibs/log"
)

func httpError2(r *http.Request, w http.ResponseWriter, code int, format string, args ...interface{}) {
	text := fmt.Sprintf(format, args...)
	log.Info("Web: %s %s: %s", r.Method, r.URL, text)
	http.Error(w, text, code)
}

// []Lease -> JSON
func convertLeases(inputLeases []dhcpd.Lease, includeExpires bool) []map[string]string {
	leases := []map[string]string{}
	for _, l := range inputLeases {
		lease := map[string]string{
			"mac":      l.HWAddr.String(),
			"ip":       l.IP.String(),
			"hostname": l.Hostname,
		}

		if includeExpires {
			lease["expires"] = l.Expiry.Format(time.RFC3339)
		}

		leases = append(leases, lease)
	}
	return leases
}

type v4ServerConfJSON struct {
	GatewayIP     string `json:"gateway_ip"`
	SubnetMask    string `json:"subnet_mask"`
	RangeStart    string `json:"range_start"`
	RangeEnd      string `json:"range_end"`
	LeaseDuration uint32 `json:"lease_duration"`
}

func v4ServerConfToJSON(c dhcpd.V4ServerConf) v4ServerConfJSON {
	return v4ServerConfJSON{
		GatewayIP:     c.GatewayIP,
		SubnetMask:    c.SubnetMask,
		RangeStart:    c.RangeStart,
		RangeEnd:      c.RangeEnd,
		LeaseDuration: c.LeaseDuration,
	}
}

func v4JSONToServerConf(j v4ServerConfJSON) dhcpd.V4ServerConf {
	return dhcpd.V4ServerConf{
		GatewayIP:     j.GatewayIP,
		SubnetMask:    j.SubnetMask,
		RangeStart:    j.RangeStart,
		RangeEnd:      j.RangeEnd,
		LeaseDuration: j.LeaseDuration,
	}
}

type v6ServerConfJSON struct {
	RangeStart    string `json:"range_start"`
	LeaseDuration uint32 `json:"lease_duration"`
}

func v6ServerConfToJSON(c dhcpd.V6ServerConf) v6ServerConfJSON {
	return v6ServerConfJSON{
		RangeStart:    c.RangeStart,
		LeaseDuration: c.LeaseDuration,
	}
}

func v6JSONToServerConf(j v6ServerConfJSON) dhcpd.V6ServerConf {
	return dhcpd.V6ServerConf{
		RangeStart:    j.RangeStart,
		LeaseDuration: j.LeaseDuration,
	}
}

func handleDHCPStatus(w http.ResponseWriter, r *http.Request) {
	leases := convertLeases(Context.dhcpServer.Leases(dhcpd.LeasesDynamic), true)
	staticLeases := convertLeases(Context.dhcpServer.Leases(dhcpd.LeasesStatic), false)

	conf := dhcpd.Config{}
	Context.dhcpServer.WriteDiskConfig(&conf)

	status := map[string]interface{}{
		"enabled":        conf.Enabled,
		"interface_name": conf.InterfaceName,
		"v4":             v4ServerConfToJSON(conf.Conf4),
		"v6":             v6ServerConfToJSON(conf.Conf6),
		"leases":         leases,
		"static_leases":  staticLeases,
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(status)
	if err != nil {
		httpError2(r, w, http.StatusInternalServerError, "Unable to marshal DHCP status json: %s", err)
		return
	}
}

type staticLeaseJSON struct {
	HWAddr   string `json:"mac"`
	IP       string `json:"ip"`
	Hostname string `json:"hostname"`
}

type dhcpServerConfigJSON struct {
	Enabled       bool             `json:"enabled"`
	InterfaceName string           `json:"interface_name"`
	V4            v4ServerConfJSON `json:"v4"`
	V6            v6ServerConfJSON `json:"v6"`
}

func handleDHCPSetConfig(w http.ResponseWriter, r *http.Request) {
	newconfig := dhcpServerConfigJSON{}
	err := json.NewDecoder(r.Body).Decode(&newconfig)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "Failed to parse new DHCP config json: %s", err)
		return
	}

	conf := dhcpd.Config{}
	conf.Enabled = newconfig.Enabled
	conf.InterfaceName = newconfig.InterfaceName
	conf.Conf4 = v4JSONToServerConf(newconfig.V4)
	conf.Conf6 = v6JSONToServerConf(newconfig.V6)
	err = Context.dhcpServer.SetConfig(conf)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "Failed to start DHCP server: %s", err)
		return
	}
}

func handleDHCPInterfaces(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{}

	ifaces, err := util.GetValidNetInterfaces()
	if err != nil {
		httpError2(r, w, http.StatusInternalServerError, "Couldn't get interfaces: %s", err)
		return
	}

	for _, iface := range ifaces {
		if iface.Flags&net.FlagLoopback != 0 {
			// it's a loopback, skip it
			continue
		}
		if iface.Flags&net.FlagBroadcast == 0 {
			// this interface doesn't support broadcast, skip it
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			httpError2(r, w, http.StatusInternalServerError, "Failed to get addresses for interface %s: %s", iface.Name, err)
			return
		}

		jsonIface := netInterfaceJSON{
			Name:         iface.Name,
			MTU:          iface.MTU,
			HardwareAddr: iface.HardwareAddr.String(),
		}

		if iface.Flags != 0 {
			jsonIface.Flags = iface.Flags.String()
		}
		// we don't want link-local addresses in json, so skip them
		for _, addr := range addrs {
			ipnet, ok := addr.(*net.IPNet)
			if !ok {
				// not an IPNet, should not happen
				httpError2(r, w, http.StatusInternalServerError, "SHOULD NOT HAPPEN: got iface.Addrs() element %s that is not net.IPNet, it is %T", addr, addr)
				return
			}
			// ignore link-local
			if ipnet.IP.IsLinkLocalUnicast() {
				continue
			}
			jsonIface.Addresses = append(jsonIface.Addresses, ipnet.IP.String())
		}
		if len(jsonIface.Addresses) != 0 {
			response[iface.Name] = jsonIface
		}

	}

	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		httpError2(r, w, http.StatusInternalServerError, "Failed to marshal json with available interfaces: %s", err)
		return
	}
}

// Perform the following tasks:
// . Search for another DHCP server running
// . Check if a static IP is configured for the network interface
// Respond with results
func handleDHCPFindActiveServer(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		errorText := fmt.Sprintf("failed to read request body: %s", err)
		log.Error(errorText)
		http.Error(w, errorText, http.StatusBadRequest)
		return
	}

	interfaceName := strings.TrimSpace(string(body))
	if interfaceName == "" {
		errorText := fmt.Sprintf("empty interface name specified")
		log.Error(errorText)
		http.Error(w, errorText, http.StatusBadRequest)
		return
	}

	found, err := dhcpd.CheckIfOtherDHCPServersPresent(interfaceName)

	othSrv := map[string]interface{}{}
	foundVal := "no"
	if found {
		foundVal = "yes"
	} else if err != nil {
		foundVal = "error"
		othSrv["error"] = err.Error()
	}
	othSrv["found"] = foundVal

	staticIP := map[string]interface{}{}
	isStaticIP, err := dhcpd.HasStaticIP(interfaceName)
	staticIPStatus := "yes"
	if err != nil {
		staticIPStatus = "error"
		staticIP["error"] = err.Error()
	} else if !isStaticIP {
		staticIPStatus = "no"
		staticIP["ip"] = util.GetSubnet(interfaceName)
	}
	staticIP["static"] = staticIPStatus

	result := map[string]interface{}{}
	result["other_server"] = othSrv
	result["static_ip"] = staticIP

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		httpError2(r, w, http.StatusInternalServerError, "Failed to marshal DHCP found json: %s", err)
		return
	}
}

func handleDHCPAddStaticLease(w http.ResponseWriter, r *http.Request) {

	lj := staticLeaseJSON{}
	err := json.NewDecoder(r.Body).Decode(&lj)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "json.Decode: %s", err)
		return
	}

	ip := net.ParseIP(lj.IP)
	if ip == nil {
		httpError2(r, w, http.StatusBadRequest, "invalid IP")
		return
	}

	mac, err := net.ParseMAC(lj.HWAddr)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "invalid MAC")
		return
	}

	lease := dhcpd.Lease{
		IP:       ip,
		HWAddr:   mac,
		Hostname: lj.Hostname,
	}
	err = Context.dhcpServer.AddStaticLease(lease)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "%s", err)
		return
	}
}

func handleDHCPRemoveStaticLease(w http.ResponseWriter, r *http.Request) {

	lj := staticLeaseJSON{}
	err := json.NewDecoder(r.Body).Decode(&lj)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "json.Decode: %s", err)
		return
	}

	ip := net.ParseIP(lj.IP)
	if ip == nil {
		httpError2(r, w, http.StatusBadRequest, "invalid IP")
		return
	}

	mac, _ := net.ParseMAC(lj.HWAddr)

	lease := dhcpd.Lease{
		IP:       ip,
		HWAddr:   mac,
		Hostname: lj.Hostname,
	}
	err = Context.dhcpServer.RemoveStaticLease(lease)
	if err != nil {
		httpError2(r, w, http.StatusBadRequest, "%s", err)
		return
	}
}

func handleReset(w http.ResponseWriter, r *http.Request) {
	Context.dhcpServer.Reset()
	onConfigModified()
}

func registerDHCPHandlers() {
	httpRegister("GET", "/control/dhcp/status", handleDHCPStatus)
	httpRegister("GET", "/control/dhcp/interfaces", handleDHCPInterfaces)
	httpRegister("POST", "/control/dhcp/set_config", handleDHCPSetConfig)
	httpRegister("POST", "/control/dhcp/find_active_dhcp", handleDHCPFindActiveServer)
	httpRegister("POST", "/control/dhcp/add_static_lease", handleDHCPAddStaticLease)
	httpRegister("POST", "/control/dhcp/remove_static_lease", handleDHCPRemoveStaticLease)
	httpRegister("POST", "/control/dhcp/reset", handleReset)
}

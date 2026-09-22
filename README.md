# openwrt-access-policy-controller

`luci-app-accesspolicycontroller` is a LuCI JavaScript application for OpenWrt
25.12 and firewall4. It controls forwarding traffic from a selected LAN
network with an nftables whitelist or blacklist and can shape whitelisted
devices with `tc` and IFB.

## Build

Copy `luci-app-accesspolicycontroller` into an OpenWrt 25.12 build tree, then
compile the package:

```sh
make package/luci-app-accesspolicycontroller/compile V=s
```

Or add to `feeds.conf.default`

```
src-git accesspolicycontroller https://github.com/smallprogram/openwrt-access-policy-controller.git;main
```


The package depends on firewall4's `nftables`, `tc-full`, `ip-full`, IFB, HTB,
mirred, flower, and scheduler kernel modules. Its init script is enabled during
package installation.

## Configuration

Open **Services -> Access Policy Controller** in LuCI.

- **Overview** selects the LAN logical network, enables the controller, and
	selects whitelist or blacklist mode.
- **Rate limit policies** define decimal upload and download limits with B/s,
	KB/s, MB/s, or GB/s units.
- **Whitelist** permits matching devices in whitelist mode and optionally
	assigns a rate limit policy. All other forwarded traffic from the selected
	LAN network is dropped.
- **Blacklist** drops matching devices in blacklist mode while other traffic
	continues through firewall4 normally.

When an entry has both an address and a MAC address, both values must match.
An IPv4 address, IPv6 address, or MAC address can be used independently.

## Traffic Control

The controller creates an HTB root qdisc on the selected LAN device and an IFB
device named `apcifb0`. It will not replace an existing root qdisc, so disable
or remove an existing SQM/qdisc configuration before applying rate limits.

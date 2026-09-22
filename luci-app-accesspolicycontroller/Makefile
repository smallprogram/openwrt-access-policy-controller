include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-accesspolicycontroller
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_MAINTAINER:=smallprogram <smallprogramzhusir@gmail.com>

LUCI_TITLE:=LuCI access policy controller
LUCI_DEPENDS:=+luci-base +nftables +tc-full +ip-full +kmod-ifb +kmod-sched-core +kmod-sched-htb +kmod-sched-act-mirred +kmod-sched-flower
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)/conffiles
/etc/config/accesspolicycontroller
endef

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./root/etc/config/accesspolicycontroller $(1)/etc/config/accesspolicycontroller
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./root/etc/init.d/accesspolicycontroller $(1)/etc/init.d/accesspolicycontroller
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) ./root/usr/sbin/accesspolicycontroller $(1)/usr/sbin/accesspolicycontroller
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-accesspolicycontroller.json $(1)/usr/share/rpcd/acl.d/luci-app-accesspolicycontroller.json
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-accesspolicycontroller.json $(1)/usr/share/luci/menu.d/luci-app-accesspolicycontroller.json
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/accesspolicycontroller.js $(1)/www/luci-static/resources/view/accesspolicycontroller.js
endef

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	/etc/init.d/accesspolicycontroller enable
	/etc/init.d/accesspolicycontroller start
}
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
'use strict';
'require view';
'require form';
'require uci';
'require tools.widgets as widgets';

function validateName(sectionId, value) {
	if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(value))
		return _('Use English letters, numbers, and hyphens only.');

	return true;
}

function validatePolicyName(sectionId, value) {
	const validation = validateName(sectionId, value);

	if (validation !== true)
		return validation;

	const duplicate = uci.sections('accesspolicycontroller', 'policy').some(function(policy) {
		return policy['.name'] !== sectionId && policy.name === value;
	});

	return duplicate ? _('A rate limit policy with this name already exists.') : true;
}

function validateRate(sectionId, value) {
	if (!/^\d+(?:\.\d+)?$/.test(value) || Number(value) <= 0)
		return _('Enter a positive number.');

	return true;
}

function addNameOption(section, validator) {
	const option = section.option(form.Value, 'name', _('Name'));

	option.rmempty = false;
	option.validate = validator || validateName;
}

function addMacOption(section) {
	const option = section.option(form.Value, 'mac', _('MAC address'));

	option.datatype = 'macaddr';
	option.rmempty = true;
	option.cfgvalue = function(sectionId) {
		const value = uci.get('accesspolicycontroller', sectionId, 'mac');
		return value ? value.toLowerCase() : value;
	};
	option.write = function(sectionId, value) {
		if (value)
			uci.set('accesspolicycontroller', sectionId, 'mac', value.toLowerCase());
		else
			uci.unset('accesspolicycontroller', sectionId, 'mac');
	};
}

function addAddressOptions(section) {
	let option = section.option(form.Value, 'ipv4', _('IPv4 address'));
	option.datatype = 'ip4addr("nomask")';
	option.rmempty = true;

	option = section.option(form.Value, 'ipv6', _('IPv6 address'));
	option.datatype = 'ip6addr("nomask")';
	option.rmempty = true;
}

function addPolicyOption(section) {
	const option = section.option(form.ListValue, 'policy', _('Rate limit policy'));

	option.value('', _('None'));
	uci.sections('accesspolicycontroller', 'policy', function(policy) {
		if (policy.name)
			option.value(policy.name);
	});
	option.rmempty = true;
}

function addCommentOption(section) {
	const option = section.option(form.Value, 'comment', _('Comment'));
	option.rmempty = true;
}

function addRateOption(section, key, title) {
	let option = section.option(form.Value, key, title);
	option.rmempty = false;
	option.placeholder = '1.5';
	option.validate = validateRate;

	option = section.option(form.ListValue, '%s_unit'.format(key), '%s %s'.format(title, _('unit')));
	option.value('B/s');
	option.value('KB/s');
	option.value('MB/s');
	option.value('GB/s');
	option.default = 'MB/s';
	option.rmempty = false;
}

return view.extend({
	load: function() {
		return uci.load('accesspolicycontroller');
	},

	render: function() {
		let map;
		let section;
		let option;

		map = new form.Map('accesspolicycontroller', _('Access Policy Controller'),
			_('Control internet access on selected internal interfaces with whitelist, blacklist, or hybrid rules. Whitelisted devices can optionally receive bandwidth limits.'));
		map.tabbed = true;

		section = map.section(form.NamedSection, 'main', 'accesspolicycontroller', _('Overview'));
		section.anonymous = true;
		section.addremove = false;

		option = section.option(form.Flag, 'enabled', _('Enable'));
		option.rmempty = false;
		option.default = '0';

		option = section.option(form.ListValue, 'mode', _('Mode'));
		option.description = _('Whitelist mode blocks devices not on the whitelist. Blacklist mode blocks only devices on the blacklist. Hybrid mode blocks blacklisted devices, applies rate limits to whitelisted devices, and allows all other devices without rate limits.');
		option.value('whitelist', _('Whitelist mode'));
		option.value('blacklist', _('Blacklist mode'));
		option.value('hybrid', _('Hybrid mode'));
		option.default = 'whitelist';
		option.rmempty = false;

		option = section.option(form.ListValue, 'chain_priority', _('Chain priority'));
		option.description = _('Controls when this access policy chain runs relative to other firewall chains. Lower values run first.');
		option.value('-300', _('Highest priority'));
		option.value('-150', _('High priority'));
		option.value('0', _('Normal priority'));
		option.value('50', _('Low priority'));
		option.default = '-300';
		option.rmempty = false;

		option = section.option(widgets.NetworkSelect, 'network', _('Application interfaces'));
		option.description = _('Select the internal interfaces where access policies apply. You can select more than one interface. Do not select WAN interfaces.');
		option.default = 'lan';
		option.multiple = true;
		option.nocreate = true;
		option.rmempty = false;

		section = map.section(form.GridSection, 'policy', _('Rate limit policies'));
		section.anonymous = true;
		section.addremove = true;
		section.nodescriptions = true;
		section.filterrow = true;
		addNameOption(section, validatePolicyName);
		addCommentOption(section);
		addRateOption(section, 'upload', _('Upload limit'));
		addRateOption(section, 'download', _('Download limit'));

		section = map.section(form.GridSection, 'whitelist', _('Whitelist'));
		section.anonymous = true;
		section.addremove = true;
		section.nodescriptions = true;
		section.filterrow = true;
		addCommentOption(section);
		addNameOption(section);
		addAddressOptions(section);
		addMacOption(section);
		addPolicyOption(section);

		section = map.section(form.GridSection, 'blacklist', _('Blacklist'));
		section.anonymous = true;
		section.addremove = true;
		section.nodescriptions = true;
		section.filterrow = true;
		addCommentOption(section);
		addNameOption(section);
		addAddressOptions(section);
		addMacOption(section);

		return map.render();
	}
});
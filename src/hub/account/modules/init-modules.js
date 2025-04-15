import Api from 'modules/api/Api';
import Auth from 'modules/auth/Auth';
import Screen from 'modules/screen/Screen';
import Boot from 'modules/boot/Boot';

const modules = {
	api: Api,
	auth: Auth,
	screen: Screen,
	boot: Boot,
};

// Contains only statically imported modules.

export default modules;

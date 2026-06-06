// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = {
	[categoryName: string]: Device[];
} & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	手机: [
		{
			name: "IQOO NEO 9",
			image: "/images/device/IQOO NEO9.jpg",
			specs: "红白魂 / 16G + 256GB",
			description: "iQOO于2023年12月发布的智能手机",
			link: "https://www.vivo.com/vivo/iqooneo9/",
		},
	],
	路由器: [
		{
			name: "Xiaomi-AX3000T",
			image: "/images/device/Xiaomi X3000T.jpg",
			specs: "1000Mbps / 5G",
			description:
				"后期产品有减配，小米我去你的",
			link: "https://www.mi.com/xiaomi-ax3000t/",
		},
	],
	电脑: [
		{
			name: "机械革命旷世X",
			image: "/images/device/机械革命.jpg",
			specs: "i7  14650hx / RTX5060",
			description:
				"机革毛病挺多的，谨慎选择",
			link: "https://www.mechrevo.com/",
		},
	],
};

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
			name: "Redmi K60 Ultra",
			image: "/images/device/IQOO NEO9.jpg",
			specs: "伊雷娜 / 16G + 512GB",
			description: "最后一代miui",
			link: "https://www.mi.com/redmi-k60ultra/",
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
			name: "联想拯救者",
			image: "/images/device/机械革命.jpg",
			specs: "i5  8300H / RTX1050ti",
			description:
				"还能打",
			link: "https://item.lenovo.com.cn/product/1040396.html/",
		},
	],
};

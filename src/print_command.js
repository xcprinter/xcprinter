import iconv from 'iconv-lite'

export default class PrintCommand {

  // 配置 WIFI
  setWifi(ssid, password) {
    const size = ssid.length + password.length + 7

    // 计算校验位
    let xor = 0x1f ^ 0x77
    xor ^= ssid.length
    for (const byte of ssid) {
      xor ^= byte
    }
    xor ^= 0x03
    xor ^= 0x01
    xor ^= password.length
    for (const byte of password) {
      xor ^= byte
    }

    const data = []
    data.push(0x1f, 0x28, 0x0f)  // 设置 Wifi
    data.push(...this._doubleDigit(size))  // 数据总长度
    data.push(0x1f, 0x77)
    data.push(ssid.length)  // SSID 长度
    data.push(...ssid)
    data.push(0x03, 0x01) // 固定 pm, km
    data.push(password.length)  // 密码长度
    data.push(...password)
    data.push(xor)

    return data
  }

  setDark(value) {
    const config = []
    config.push(0x05)  // 波特率
    config.push(0x01) // 切刀开关，0 为可用
    config.push(0x00)  // 蜂鸣器开关
    config.push(0x00)  // 钱箱开关
    config.push(0x00)  // 打印宽度，0 为 576
    config.push(value)  // 浓度选项
    config.push(0xff)  // codepage, 0xff 中文， 0xfd utf-8
    config.push(0x00)  // 7 无效
    config.push(0x00)  // 字体

    // 计算校验位
    let xor = 0x1f ^ 0x73
    for (const i of config) {
      xor ^= i
    }

    const data = []
    data.push(0x1f, 0x28, 0x0f)
    data.push(0x0c, 0x00) // 固定
    data.push(0x1f, 0x73) // 固定
    data.push(...config)
    data.push(xor)   // XOR 校验值
  }

  _doubleDigit(value) {
    return [value % 256, Math.floor(value / 256)]
  }

}

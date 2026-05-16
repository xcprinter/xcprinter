import iconv from 'iconv-lite'

export default class PrintPOS {
  static TXT_NORMAL = [0x1b, 0x21, 0x00]

  constructor() {
    this.data = []
    this.debug = false
    this.data.push(0x1b, 0x40)  // 初始化打印机：清除打印缓存，各参数恢复默认值
    this.data.push(0x1d, 0x4c, 0x12, 0x00)  // 设置左限（左边距）：向右移动 18（0x12）点
    //this.data.push(0x1c, 0x26) // 启用 16×16 点阵中文打印模式
    //this.data.push(0x1c, 0x21, 0x00)  // 中文字间距为 0 点
  }

  render() {
    this.data.push(...Array(5).fill(0x0a))  // 5个换行
    if (this.debug) {
      this.debug()
    }
    return this.data
  }

  debug() {
    console.debug('打印数据：', this.data.map(i => { return i.toString(16).padStart(2, '0') }).join(' '))
  }

  text_big(value) {
    this.data.push(0x1b, 0x21, 0x30) // Quad area text
    this.data.push(...iconv.encode(value, 'gb18030')) // 将 value 转为 bytes
    this.data.push(...PrintPOS.TXT_NORMAL)
    this.data.push(0x0a)  // 换行
  }

  text(value) {
    this.data.push(...PrintPOS.TXT_NORMAL)
    this.data.push(...iconv.encode(value, 'gb18030')) // 将 value 转为 bytes
    this.data.push(...PrintPOS.TXT_NORMAL)
    this.data.push(0x0a)  // 换行
  }

  qrcode(value) {
    const bytes = iconv.encode(value, 'gb18030')
    const qrSize = [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x06] // 二维码模块大小
    const qrErr = [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30] // 错误校正水平
    const qrData = [0x1d, 0x28, 0x6b, bytes.length + 3, 0x00, 0x31, 0x50, 0x30] // 二维码数据
    const qrRun = [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30] // 打印二维码

    this.data.push(
      ...qrSize,
      ...qrErr,
      ...qrData,
      ...bytes,
      ...qrRun
    )
    this.data.push(0x0a, 0x0a)
  }

  // 02 数据在条码下方
  barcode(value, { pos = 2, height = 50, width = 2, format = 4 } = {}) {
    const bytes = iconv.encode(value, 'gb18030')
    const barPostion = [0x1d, 0x48, pos]
    const barHeight = [0x1d, 0x68, height]
    const barWidth = [0x1d, 0x77, width]
    const barFormat = [0x1d, 0x6b, format]

    this.data.push(
      ...barPostion,
      ...barHeight,
      ...barWidth,
      ...barFormat,
      ...bytes,
      0x00
    )
  }

  image(value, meta) {
    this.data.push(
      0x1d, 0x76, 0x30, 0x00,
      ...this.#doubleDigit(meta.byteWidth),
      ...this.#doubleDigit(meta.height),
      ...value
    )
  }

  disconnect() {
    this.data.push(
      0x1f, 0x28, 0x63, 0x02, 0x00, 0x44, 0x42
    )
  }

  #doubleDigit(value) {
    return [value % 256, Math.floor(value / 256)]
  }

}
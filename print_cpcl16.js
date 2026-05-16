import iconv from 'iconv-lite'
import Qrcode from 'qrcode-generator'

export default class PrintCPCL {
  static PADDING_TOP = 40

  constructor({ width = 72, height = 40, rotate = 0 } = {}) {
    this.width = width * 8
    this.height = height * 8
    this.qty = 1
    this.currentY = PrintCPCL.PADDING_TOP
    this.data = []
    this.data.push(0x1a, 0x5b, 0x01) // 标签开始指令
    this.data.push(0x00, 0x00, 0x00, 0x00) // x, y 相对于 0,0 的偏移量
    this.data.push(...this.#doubleDigit(this.width), ...this.#doubleDigit(this.height), rotate)
  }

  render() {     
    this.data.push(0x1a, 0x5d, 0x00) // 标签结束指令
    this.data.push(0x1a, 0x4f, 0x00) // 标签打印指令
    this.data.push(0x1b, 0x6d)

    this.debug()

    return this.data
  }

  debug() {
    console.debug('打印数据：', this.data.map(i => { return i.toString(16).padStart(2, '0') }).join(' '))
  }

  text(data, { font = 8, size = 0, x = 0, y = 36, line_add = true } = {}) {
    this.data.push(0x1a, 0x54, 0x00) // 标签文本指令
    this.data.push(...this.#doubleDigit(x), ...this.#doubleDigit(this.currentY))  
    this.data.push(...iconv.encode(data, 'gb2312'))
    this.data.push(0x00) //  终止文本打印流

    if (line_add) {
      this.currentY = this.currentY + y
    }
  }

  text_bold(data, { size = 1, ...options } = {}) {
    this.texts.push('SETBOLD 2')
    this.texts.push(`SETMAG ${size} ${size}`)

    this.text(data, { size: size, y: 36 * size, ...options })
    this.texts.push('SETMAG 0 0')
    this.texts.push('SETBOLD 0')
  }

  qrcode_right(data, { y = PrintCPCL.PADDING_TOP, u = 6 } = {}) {
    const qrcodeEncoder = Qrcode(4, 'M')
    qrcodeEncoder.addData(data)
    qrcodeEncoder.make()
    const size = qrcodeEncoder.getModuleCount()
    console.debug('qrcode size：', size)
    const x = this.width - (u * size) - 16

    const qrData = [
      `B QR ${x} ${y} M 2 U ${u}`,
      `MA,${data}`,
      'ENDQR'
    ].join("\n")
    this.qrcodes.push(qrData)
  }

  lineX({ x0 = 0, x1 = 40 * 8, width = 8, height = 36 } = {}) {
    this.texts.push(`L ${x0} ${this.currentY} ${x1} ${this.currentY} ${width}`)
    this.currentY = this.currentY + height
  }

  image(dataArray, { x = 0, y = this.currentY, meta = {} } = {}) {
    this.data.push(
      0x1a, 0x21, 0x01, // 位图指令
      ...this.#doubleDigit(x),
      ...this.#doubleDigit(y),
      ...this.#doubleDigit(meta.width),
      ...this.#doubleDigit(meta.height)
    )
    this.data.push(0x00, 0x11)
    this.data.push(...dataArray)
  }

  imagePos(value, meta) {
    this.data.push(
      0x1d, 0x76, 0x30, 0x00,
      ...this.#doubleDigit(meta.byteWidth),
      ...this.#doubleDigit(meta.height),
      ...value
    )
  }

  barcode(data, { width = 1, ratio = 1, height = 50, x = 0 } = {}) {
    this.texts.push(`B 39 ${width} ${ratio} ${height} ${x} ${this.currentY} ${data}`)
    this.currentY = this.currentY + height
  }

  #doubleDigit(value) {
    return [value % 256, Math.floor(value / 256)]
  }

}
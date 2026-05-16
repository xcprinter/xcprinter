import iconv from 'iconv-lite'
import Qrcode from 'qrcode-generator'

export default class PrintCPCL {
  static PADDING_TOP = 40

  constructor({ width = 72, height = 40 } = {}) {
    this.width = width * 8
    this.height = height * 8
    this.qty = 1
    this.currentY = PrintCPCL.PADDING_TOP
    this.data = []
    this.data.push(`! 0 200 200 ${this.height} ${this.qty}`)
    //this.data.push(`PW ${this.width}`)
    //this.data.push('PREFEED 64')
  }

  render() {
    this.data.push('FORM')
    this.data.push('PRINT')
    this.data.push('')  // 最后统一调用 join("\n")

    const result = this.data.join("\r\n")
    console.debug('打印数据：')
    console.debug(result)

    return iconv.encode(result, 'hex')
  }

  text(data, { font = 8, size = 0, x = 0, y = 36, line_add = true } = {}) {
    this.data.push(`T ${font} ${size} ${x} ${this.currentY} ${data}`)
    if (line_add) {
      this.currentY = this.currentY + y
    }
  }

  text_bold(data, { size = 1, ...options } = {}) {
    this.data.push('SETBOLD 2')
    this.data.push(`SETMAG ${size} ${size}`)
    this.text(data, { size: size, y: 36 * size, ...options })
    this.data.push('SETMAG 0 0')
    this.data.push('SETBOLD 0')
  }

  qrcode_right(data, { y = PrintCPCL.PADDING_TOP, u = 6 } = {}) {
    const qrcodeEncoder = Qrcode(4, 'M')
    qrcodeEncoder.addData(data)
    qrcodeEncoder.make()
    const size = qrcodeEncoder.getModuleCount()
    console.debug('qrcode size：', size)
    const x = this.width - (u * size) - 16

    this.data.push(
      `B QR ${x} ${y} M 2 U ${u}`,
      `MA,${data}`,
      'ENDQR'
    )
  }

  box({ x0 = 0, y0 = this.currentY, x1 = 150, y1 = this.currentY + 150, width = 2 } = {}) {
    this.data.push(`BOX ${x0} ${y0} ${x1} ${y1} ${width}`)
    this.currentY = this.currentY + y1
  }

  lineX({ x0 = 0, x1 = 40 * 8, width = 8, height = 36 } = {}) {
    this.data.push(`L ${x0} ${this.currentY} ${x1} ${this.currentY} ${width}`)
    this.currentY = this.currentY + height
  }

  image(dataArray, { x = 0, meta = {} } = {}) {
    const imgData = dataArray.map(i => { return i.toString(16).padStart(2, '0').toUpperCase() }).join('')
    this.data.push(
      `EG ${meta.byteWidth} ${meta.height*2} ${x} ${this.currentY} ${imgData}`
    )
    this.currentY = this.currentY + meta.height
  }

  barcode(data, { width = 1, ratio = 1, height = 50, x = 0 } = {}) {
    this.data.push(`B 39 ${width} ${ratio} ${height} ${x} ${this.currentY} ${data}`)
    this.currentY = this.currentY + height
  }

}
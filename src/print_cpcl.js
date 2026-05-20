import iconv from 'iconv-lite'
import Qrcode from 'qrcode-generator'

export default class PrintCPCL {
  // avoid using class fields/private methods so output is compatible with older JS parsers
  // static PADDING_TOP = 40  (replaced below)

  constructor({ width = 72, height = 40 } = {}) {
    this.width = width * 8
    this.height = height * 8
    this.qty = 1
    this.currentY = PrintCPCL.PADDING_TOP
    this.data = []
    this._pushData(`! 0 200 200 ${this.height} ${this.qty}`)
    //this.#pushData(`PW ${this.width}`)
    //this.#pushData('PREFEED 64')
  }

  render() {
    this._pushData('FORM')
    this._pushData('PRINT')

    console.debug('打印数据：')
    console.debug(this.data)

    return this.data
  }

  text(data, { font = 8, size = 0, x = 0, y = 36, line_add = true } = {}) {
    this._pushData(`T ${font} ${size} ${x} ${this.currentY} ${data}`)
    if (line_add) {
      this.currentY = this.currentY + y
    }
  }

  text_big(data, { size = 1, ...options } = {}) {
    this._pushData('SETBOLD 2')
    this._pushData(`SETMAG ${size} ${size}`)
    this.text(data, { size: size, y: 36 * size, ...options })
    this._pushData('SETMAG 0 0')
    this._pushData('SETBOLD 0')
  }

  qrcode_right(data, { y = PrintCPCL.PADDING_TOP, u = 6 } = {}) {
    const qrcodeEncoder = Qrcode(4, 'M')
    qrcodeEncoder.addData(data)
    qrcodeEncoder.make()
    const size = qrcodeEncoder.getModuleCount()
    console.debug('qrcode size：', size)
    const x = this.width - (u * size) - 16

    this._pushData(
      `B QR ${x} ${y} M 2 U ${u}`,
      `MA,${data}`,
      'ENDQR'
    )
  }

  box({ x0 = 0, y0 = this.currentY, x1 = 150, y1 = this.currentY + 150, width = 2 } = {}) {
    this._pushData(`BOX ${x0} ${y0} ${x1} ${y1} ${width}`)
    this.currentY = this.currentY + y1
  }

  lineX({ x0 = 0, x1 = 40 * 8, width = 8, height = 36 } = {}) {
    this._pushData(`L ${x0} ${this.currentY} ${x1} ${this.currentY} ${width}`)
    this.currentY = this.currentY + height
  }

  image(dataArray, { x = 0, meta = {} } = {}) {
    const imgData = dataArray.map(i => { return i.toString(16).padStart(2, '0').toUpperCase() }).join('')
    this.data.push(
      ...iconv.encode(`CG ${meta.byteWidth} ${meta.height} ${x} ${this.currentY} `, 'gb18030'),
      ...dataArray,
      ...iconv.encode("\r\n", 'gb18030')
    )
    this.currentY = this.currentY + meta.height
  }

  barcode(data, { width = 1, ratio = 1, height = 50, x = 0 } = {}) {
    this._pushData(`B 39 ${width} ${ratio} ${height} ${x} ${this.currentY} ${data}`)
    this.currentY = this.currentY + height
  }

  // regular (non-private) helper so output is transpile-friendly
  _pushData(...value) {
    value.forEach(i => {
      this.data.push(...iconv.encode(`${i}\r\n`, 'gb18030'))
    })
  }

}

// define static constant without using class fields syntax
PrintCPCL.PADDING_TOP = 40


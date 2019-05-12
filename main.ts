enum StepAngleFixed {
    //% block="0.9"
    StepAngle0p9 = 0,
    //% block="1.8"
    StepAngle1p8 = 1,
    //% block="3.6"
    StepAngle3p6 = 3,
    //% block="3.75"
    StepAngle3p75 = 3,
    //% block="7.5"
    StepAngle7p5 = 4,
    //% block="15"
    StepAngle15 = 5,
    //% block="18"
    StepAngle18 = 6
}

enum RotorDir {
    //% block="Clock wise"
    ClockWise = 0,
    //% block="Counter Clock wise"
    CounterClockWise = 1
}

enum Excitation {
    //% block="Full Step"
    FullStep = 0,
    //% block="Half Step"
    HalfStep = 1
}

enum ON_OFF_Flag {
    //% block="Stop"
    OFF = 0,
    //% block="Run"
    ON = 1
}

function int2ieee754(val: number): number {
    if (val == 0) {
        return 0x00000000
    }
    let sign = (val > 0) ? 0 : (0x01 << 31)
    let out = (val > 0) ? val : -val
    let msb = 0
    for (let i = 31; i >= 0; i--) {
        if ((0x01 << i) & out) {
            msb = i
            break
        }
    }
    let ext = msb - 23
    if (ext < 0) {
        out = (out << (-ext)) & 0x7FFFFF
    } else {
        out = (out >> ext) & 0x7FFFFF
    }
    ext = ((ext + 127) & 0xFF) << 23
    out = sign | ext | out
    return out
}

//% weight=70 icon="\uf2db" color=#555555 block="LV8548Step"
namespace lv8548step {
    //% blockId=show_strings block="Init LV8548Step TX to %tx|RX to %rx"
    //% tx.defl=SerialPin.P2
    //% rx.defl=SerialPin.P1
    export function init(tx: SerialPin, rx: SerialPin): void {
        serial.redirect(
            tx,
            rx,
            BaudRate.BaudRate19200
        )
        basic.pause(100)
        let bufrini = pins.createBuffer(3)
        bufrini.setNumber(NumberFormat.UInt8LE, 0, 0xA5)
        bufrini.setNumber(NumberFormat.UInt8LE, 1, 0xFE)
        // Step
        bufrini.setNumber(NumberFormat.UInt8LE, 2, 0x01)
        serial.writeBuffer(bufrini)
    }

    //% blockId=lv8548step_setstepangle block="Set motor angle/step to %deg"
    export function setStepAngle(deg: StepAngleFixed): void {
        let bufr = pins.createBuffer(8);
        bufr.setNumber(NumberFormat.UInt8LE, 0, 0xA5)
        bufr.setNumber(NumberFormat.UInt8LE, 1, 0xFF)
        bufr.setNumber(NumberFormat.UInt8LE, 2, 0x05)
        bufr.setNumber(NumberFormat.UInt8LE, 3, 0x69)
        let fangle = 0x00000000
        switch (deg) {
            case StepAngleFixed.StepAngle0p9:
                fangle = 0x3F666666
                break
            case StepAngleFixed.StepAngle1p8:
                fangle = 0x3FE66666
                break
            case 2:
                fangle = 0x40666666
                break
            case 3:
                fangle = 0x40700000
                break
            case 4:
                fangle = 0x40F00000
                break
            case 5:
                fangle = 0x41700000
                break
            case 6:
                fangle = 0x41900000
                break
        }
        for (let i = 0; i < 4; i++) {
            bufr.setNumber(NumberFormat.UInt8LE, i + 4, (fangle >> i * 8) & 0xFF)
        }
        serial.writeBuffer(bufr)
    }

    //% blockId=lv8548step_motorrotationdeg block="Deg%deg|Freq%freq|Dir%cwccw|Excitation%exc"
    export function motorRotationDeg(freq: number, deg: number, cwccw: RotorDir, exc: Excitation): void {

        let bufr = pins.createBuffer(14);
        bufr.setNumber(NumberFormat.UInt8LE, 0, 0xA5)
        bufr.setNumber(NumberFormat.UInt8LE, 1, 0xFF)
        bufr.setNumber(NumberFormat.UInt8LE, 2, 0x03)
        bufr.setNumber(NumberFormat.UInt8LE, 3, 0x6A)
        for (let i = 0; i < 4; i++) {
            bufr.setNumber(NumberFormat.UInt8LE, i + 4, (freq >> i * 8) & 0xFF)
        }
        for (let i = 0; i < 4; i++) {
            bufr.setNumber(NumberFormat.UInt8LE, i + 8, (deg >> i * 8) & 0xFF)
        }
        bufr.setNumber(NumberFormat.UInt8LE, 12, cwccw)
        bufr.setNumber(NumberFormat.UInt8LE, 13, exc)
        serial.writeBuffer(bufr)
    }

    //% blockId=lv8548step_motorrotationtime block="Time%time|Freq%freq|Dir%cwccw|Excitation%exc"
    export function motorRotationTime(freq: number, time: number, cwccw: RotorDir, exc: Excitation): void {

        let bufr = pins.createBuffer(14);
        bufr.setNumber(NumberFormat.UInt8LE, 0, 0xA5)
        bufr.setNumber(NumberFormat.UInt8LE, 1, 0xFF)
        bufr.setNumber(NumberFormat.UInt8LE, 2, 0x03)
        bufr.setNumber(NumberFormat.UInt8LE, 3, 0x6B)
        for (let i = 0; i < 4; i++) {
            bufr.setNumber(NumberFormat.UInt8LE, i + 4, (freq >> i * 8) & 0xFF)
        }
        for (let i = 0; i < 4; i++) {
            bufr.setNumber(NumberFormat.UInt8LE, i + 8, (time >> i * 8) & 0xFF)
        }
        bufr.setNumber(NumberFormat.UInt8LE, 12, cwccw)
        bufr.setNumber(NumberFormat.UInt8LE, 13, exc)
        serial.writeBuffer(bufr)
    }

    //% blockId=lv8548step_motorrotationstep block="Step%step|Freq%freq|Dir%cwccw|Excitation%exc"
    export function motorRotationStep(freq: number, step: number, cwccw: RotorDir, exc: Excitation): void {

        let bufr = pins.createBuffer(14);
        bufr.setNumber(NumberFormat.UInt8LE, 0, 0xA5)
        bufr.setNumber(NumberFormat.UInt8LE, 1, 0xFF)
        bufr.setNumber(NumberFormat.UInt8LE, 2, 0x03)
        bufr.setNumber(NumberFormat.UInt8LE, 3, 0x6C)
        for (let i = 0; i < 4; i++) {
            bufr.setNumber(NumberFormat.UInt8LE, i + 4, (freq >> i * 8) & 0xFF)
        }
        for (let i = 0; i < 4; i++) {
            bufr.setNumber(NumberFormat.UInt8LE, i + 8, (step >> i * 8) & 0xFF)
        }
        bufr.setNumber(NumberFormat.UInt8LE, 12, cwccw)
        bufr.setNumber(NumberFormat.UInt8LE, 13, exc)
        serial.writeBuffer(bufr)
    }

    //% blockId=lv8548step_motorrotationhold block="Hold stepper"
    export function motorRotationHold(): void {
        let bufr = pins.createBuffer(4);
        bufr.setNumber(NumberFormat.UInt8LE, 0, 0xA5)
        bufr.setNumber(NumberFormat.UInt8LE, 1, 0xFF)
        bufr.setNumber(NumberFormat.UInt8LE, 2, 0x03)
        bufr.setNumber(NumberFormat.UInt8LE, 3, 0x6E)
        serial.writeBuffer(bufr)
    }

    //% blockId=lv8548step_motorrotationfree block="Free stepper"
    export function motorRotationFree(): void {
        let bufr = pins.createBuffer(4);
        bufr.setNumber(NumberFormat.UInt8LE, 0, 0xA5)
        bufr.setNumber(NumberFormat.UInt8LE, 1, 0xFF)
        bufr.setNumber(NumberFormat.UInt8LE, 2, 0x03)
        bufr.setNumber(NumberFormat.UInt8LE, 3, 0x6F)
        serial.writeBuffer(bufr)
    }

}
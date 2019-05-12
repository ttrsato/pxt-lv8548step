basic.forever(() => {
    lv8548step.init(SerialPin.P0, SerialPin.P1)
    lv8548step.setStepAngle(StepAngleFixed.StepAngle0p9)
})
package com.islamicunity.frontend.styles

import org.jetbrains.compose.web.css.*

object AppStyles : StyleSheet() {
    val container by style {
        display(DisplayStyle.Flex)
        flexDirection(FlexDirection.Column)
        padding(20.px)
        fontFamily("Inter", "sans-serif")
    }

    val header by style {
        fontSize(24.px)
        fontWeight("bold")
        color(Color("#006400")) // Islamic Green
        marginBottom(20.px)
    }
}

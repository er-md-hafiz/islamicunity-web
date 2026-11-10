package com.islamicunity.frontend

import androidx.compose.runtime.Composable
import com.islamicunity.frontend.components.PrayerTimesCard
import com.islamicunity.frontend.components.QuranCard
import org.jetbrains.compose.web.dom.Div
import org.jetbrains.compose.web.dom.H1
import org.jetbrains.compose.web.dom.Text

@Composable
fun App() {
    Div {
        H1 {
            Text("Islamic Unity Dashboard")
        }
        
        PrayerTimesCard()
        
        QuranCard()
    }
}

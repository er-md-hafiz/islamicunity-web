package com.islamicunity.frontend.components

import androidx.compose.runtime.*
import com.islamicunity.models.PrayerTimesResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.jetbrains.compose.web.css.*
import org.jetbrains.compose.web.dom.*

@Composable
fun PrayerTimesCard() {
    var prayerTimes by remember { mutableStateOf<PrayerTimesResponse?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    val client = remember {
        HttpClient {
            install(ContentNegotiation) {
                json(Json { ignoreUnknownKeys = true })
            }
        }
    }

    LaunchedEffect(Unit) {
        try {
            // Fetching from our backend proxy
            val response: PrayerTimesResponse = client.get("http://localhost:8080/api/prayer-times").body()
            prayerTimes = response
        } catch (e: Exception) {
            error = e.message
        }
    }

    Div({
        style {
            padding(20.px)
            backgroundColor(Color.white)
            borderRadius(10.px)
            boxShadow("0 2px 4px rgba(0,0,0,0.1)")
            marginBottom(20.px)
        }
    }) {
        H2 { Text("Prayer Times") }

        if (error != null) {
            P({ style { color(Color.red) } }) { Text("Error: $error") }
        } else if (prayerTimes == null) {
            P { Text("Loading...") }
        } else {
            val timings = prayerTimes!!.data.timings
            Ul {
                Li { Text("Fajr: ${timings.Fajr}") }
                Li { Text("Dhuhr: ${timings.Dhuhr}") }
                Li { Text("Asr: ${timings.Asr}") }
                Li { Text("Maghrib: ${timings.Maghrib}") }
                Li { Text("Isha: ${timings.Isha}") }
            }
        }
    }
}

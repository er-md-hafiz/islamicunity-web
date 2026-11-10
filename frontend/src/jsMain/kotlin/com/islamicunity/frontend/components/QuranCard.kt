package com.islamicunity.frontend.components

import androidx.compose.runtime.*
import com.islamicunity.models.SurahResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.jetbrains.compose.web.css.*
import org.jetbrains.compose.web.dom.*

@Composable
fun QuranCard() {
    var surahList by remember { mutableStateOf<SurahResponse?>(null) }
    
    val client = remember {
        HttpClient {
            install(ContentNegotiation) {
                json(Json { ignoreUnknownKeys = true })
            }
        }
    }

    LaunchedEffect(Unit) {
        try {
            val response: SurahResponse = client.get("http://localhost:8080/api/quran/surahs").body()
            surahList = response
        } catch (e: Exception) {
            console.log(e.message)
        }
    }

    Div({
        style {
            padding(20.px)
            backgroundColor(Color.white)
            borderRadius(10.px)
            boxShadow("0 2px 4px rgba(0,0,0,0.1)")
        }
    }) {
        H2 { Text("Quran - Surahs") }

        if (surahList == null) {
            P { Text("Loading Quran...") }
        } else {
            Ul {
                surahList!!.data.take(10).forEach { surah ->
                    Li { 
                        Text("${surah.number}. ${surah.englishName} (${surah.name})") 
                    }
                }
            }
        }
    }
}

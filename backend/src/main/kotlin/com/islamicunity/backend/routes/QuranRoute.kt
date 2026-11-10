package com.islamicunity.backend.routes

import com.islamicunity.backend.network.httpClient
import com.islamicunity.models.SurahResponse
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.quranRoutes() {
    route("/quran") {
        get("/surahs") {
            try {
                val response: SurahResponse = httpClient.get("http://api.alquran.cloud/v1/surah").body()
                call.respond(response)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
            }
        }

        get("/surah/{number}") {
            val number = call.parameters["number"]?.toIntOrNull()
            if (number == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid Surah number")
                return@get
            }
            
            // Proxying basic surah info or full text could be complex, for now returning generic success or implementing specific proxy
            // Just a placeholder implementation as full Surah content requires identifying edition, etc.
             call.respond(HttpStatusCode.NotImplemented, "Surah details not fully implemented in proxy yet.")
        }
    }
}

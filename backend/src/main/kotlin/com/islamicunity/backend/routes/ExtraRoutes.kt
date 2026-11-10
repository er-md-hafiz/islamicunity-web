package com.islamicunity.backend.routes

import com.islamicunity.backend.network.httpClient
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.JsonObject

fun Route.extraRoutes() {
    route("/extra") {
        // Qibla API
        // Android: v1/qibla/25.4106386/51.1846025
        get("/qibla/{latitude}/{longitude}") {
            val latitude = call.parameters["latitude"]
            val longitude = call.parameters["longitude"]
            
            if (latitude == null || longitude == null) {
                call.respond(HttpStatusCode.BadRequest, "Latitude and Longitude required")
                return@get
            }

            try {
                // We return JsonObject to stay generic as we didn't define specific models for these yet
                val response: JsonObject = httpClient.get("https://api.aladhan.com/v1/qibla/$latitude/$longitude").body()
                call.respond(response)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
            }
        }

        // Calendar API
        // Android: v1/calendar/{year}/{month}
        get("/calendar/{year}/{month}") {
            val year = call.parameters["year"]
            val month = call.parameters["month"]
            
            if (year == null || month == null) {
                call.respond(HttpStatusCode.BadRequest, "Year and Month required")
                return@get
            }

            try {
                // Using grid (Hijri) calendar or standard? Defaulting to standard call which returns both
                val response: JsonObject = httpClient.get("https://api.aladhan.com/v1/calendar/$year/$month").body()
                call.respond(response)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.message))
            }
        }
    }
}

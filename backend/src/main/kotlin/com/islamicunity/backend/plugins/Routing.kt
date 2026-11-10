package com.islamicunity.backend.plugins

import com.islamicunity.backend.routes.prayerTimesRoutes
import com.islamicunity.backend.routes.quranRoutes
import com.islamicunity.backend.routes.extraRoutes
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Islamic Unity Backend Running")
        }
        
        // Static content (Frontend)
        staticResources("/", "static")

        // API Routes
        route("/api") {
            prayerTimesRoutes()
            quranRoutes()
            extraRoutes()
        }
    }
}

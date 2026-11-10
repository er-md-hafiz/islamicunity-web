plugins {
    // this is necessary to avoid the plugins to be loaded multiple times
    // in each subproject's classloader
    kotlin("multiplatform") version "1.9.22" apply false
    kotlin("jvm") version "1.9.22" apply false
    id("org.jetbrains.compose") version "1.6.0" apply false
    id("io.ktor.plugin") version "2.3.8" apply false
}

group = "com.islamicunity"
version = "1.0-SNAPSHOT"

allprojects {
    repositories {
        mavenCentral()
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
        google()
    }
}

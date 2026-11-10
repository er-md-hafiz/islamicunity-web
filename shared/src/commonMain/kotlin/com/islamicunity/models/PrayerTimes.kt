package com.islamicunity.models

import kotlinx.serialization.Serializable

@Serializable
data class PrayerTimesResponse(
    val code: Int,
    val status: String,
    val data: PrayerData
)

@Serializable
data class PrayerData(
    val timings: Timings,
    val date: DateInfo,
    val meta: Meta
)

@Serializable
data class Timings(
    val Fajr: String,
    val Sunrise: String,
    val Dhuhr: String,
    val Asr: String,
    val Sunset: String,
    val Maghrib: String,
    val Isha: String,
    val Imsak: String,
    val Midnight: String
)

@Serializable
data class DateInfo(
    val readable: String,
    val timestamp: String,
    val hijri: HijriDate,
    val gregorian: GregorianDate
)

@Serializable
data class HijriDate(
    val date: String,
    val format: String,
    val day: String,
    val weekday: Weekday,
    val month: Month,
    val year: String,
    val designation: Designation
)

@Serializable
data class GregorianDate(
    val date: String,
    val format: String,
    val day: String,
    val weekday: Weekday,
    val month: Month,
    val year: String,
    val designation: Designation
)

@Serializable
data class Weekday(
    val en: String,
    val ar: String? = null
)

@Serializable
data class Month(
    val number: Int,
    val en: String,
    val ar: String? = null
)

@Serializable
data class Designation(
    val abbreviated: String,
    val expanded: String
)

@Serializable
data class Meta(
    val latitude: Double,
    val longitude: Double,
    val timezone: String,
    val method: Method,
    val latitudeAdjustmentMethod: String,
    val midnightMode: String,
    val school: String,
    val offset: Map<String, Int>
)

@Serializable
data class Method(
    val id: Int,
    val name: String,
    val params: Map<String, Double>
)

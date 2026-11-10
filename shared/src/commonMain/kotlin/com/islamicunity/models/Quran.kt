package com.islamicunity.models

import kotlinx.serialization.Serializable

@Serializable
data class SurahResponse(
    val code: Int,
    val status: String,
    val data: List<Surah>
)

@Serializable
data class Surah(
    val number: Int,
    val name: String,
    val englishName: String,
    val englishNameTranslation: String,
    val numberOfAyahs: Int,
    val revelationType: String
)

@Serializable
data class AyahResponse(
    val code: Int,
    val status: String,
    val data: AyahData
)

@Serializable
data class AyahData(
    val number: Int,
    val name: String,
    val englishName: String,
    val EnglishNameTranslation: String,
    val revelationType: String,
    val ayahs: List<Ayah>
)

@Serializable
data class Ayah(
    val number: Int,
    val text: String,
    val numberInSurah: Int,
    val juz: Int,
    val manzil: Int,
    val page: Int,
    val ruku: Int,
    val hizbQuarter: Int,
    val sajda: Boolean // Simplified, can be object in full API
)

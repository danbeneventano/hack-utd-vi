<template>
    <v-app id="app" style="width: 200px; height: 300px; background-color: #ffffff">
        <v-content>
            <v-container class="fill-height pb-0" v-if="!$root.disabled">
                <v-row align="start" justify="start" class="fill-height py-6">
                    <v-col align="center" justify="start" class="py-0">
                        <v-progress-circular :color="color" :indeterminate="!loaded" size="100" width="10" :value="$root.emotionScore">
                            <span class="font-weight-bold headline">
                                {{$root.emotionScore <= 0 ? '' : `${$root.emotionScore}%`}}
                            </span>
                        </v-progress-circular>
                        <p v-if="!loaded" class="pt-4">Analyzing webpage...</p>
                        <p v-if="!loaded" class="pt-8 caption">Tip: Not working? Try refreshing the page.</p>
                        <v-slide-y-transition>
                            <div v-show="loaded">
                                <p class="body-2 pt-4" :style="{ color: color }">{{$root.description}}</p>
                                <p class="caption">Emotion Score: {{$root.emotionScore}}%</p>
                                <p class="pt-2" v-if="$root.highlighted">{{$root.highlightCount}} words mentioned in an emotional context have been highlighted.</p>
                            </div>
                        </v-slide-y-transition>
                    </v-col>
                </v-row>
            </v-container>
            <v-container class="fill-height" v-else>
                <v-row align="center" justify="center" class="fill-height">
                    <v-col align="center" justify="center">
                        <p class="subtitle-1">Emotilyze is disabled on this page.</p>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>

export default {
    name: 'AppComponent',
    data() {
        return {

        }
    },
    computed: {
        loaded() {
            return this.$root.emotionScore > 0
        },
        color() {
            const emotionScore = this.$root.emotionScore
            if (emotionScore <= 15) {
                return "#4CAF50"
            } else if (emotionScore > 15 && emotionScore <= 50) {
                return "#FF9800"
            } else if (emotionScore > 50 && emotionScore <= 100) {
                return "#F44336"
            } else {
                return "#3F51B5"
            }
        }
    },
    watch: {
        color(newValue) {
            this.$vuetify.theme.themes.light.primary = newValue
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

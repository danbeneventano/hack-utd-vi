<template>
    <v-app id="app" style="width: 200px; height: 300px">
        <v-content>
            <v-container>
                <v-row align="center" justify="center" class="fill-height">
                    <v-col align="center" justify="center">
                        <v-progress-circular color="primary" :indeterminate="!loaded" size="100" width="15" :value="percent">
                            <span class="font-weight-bold headline">
                                {{$root.emotionScore <= 0 ? '' : `${$root.emotionScore}%`}}
                            </span>
                        </v-progress-circular>
                        <p class="body-2 pt-4" :style="{ color: color }" v-if="loaded">This text is mostly positive</p>
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
            percent: 0
        }
    },
    mounted() {
        setTimeout(() => {
            this.percent = this.$root.emotionScore
        }, 100)
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

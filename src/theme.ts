import { extendTheme } from "@chakra-ui/react"
import '@fontsource/open-sans/700.css'
import '@fontsource/montserrat/400.css'
// 2. Call `extendTheme` and pass your custom values
const theme = extendTheme({
    fonts: {
        heading: `'Open Sans', sans-serif`,
        body: `'montserrat', sans-serif`,
    },
    colors: {
        color: {
            100: "#000000",
            200: "#7FBD2C",
            300: "#7FBF28",
            400: "rgba(0, 0, 0, 0.8)",
            500: "#ffffff",
            600: "#05637D",
            700:'#2373C2',
            800: '#F5F5F5',
            900: '#0061F7',
            1000:'#D5EAFF',
            1100: '#6393C3',
            1200: '#ACD5FE',
            1300: '#D9D9D9',
            1400: '#F7F7F7',
            1500: '#C0C0C0'
        },
    },
})

export default theme
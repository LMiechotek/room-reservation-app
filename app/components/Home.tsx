import FeaturesSection from "./Home/Features/Features";
import IntroSection from "./Home/Intro Section/IntroSection";

export default function Home() {
    return (
        <div className="overflow-hidden">
            <IntroSection/>
            <FeaturesSection/>
        </div>
    )
}
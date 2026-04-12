import countries from "i18n-iso-countries";
import arLocale from "i18n-iso-countries/langs/ar.json";

// Register the Arabic language
countries.registerLocale(arLocale);

export const getNationalityOptions = () => {
    const countryObj = countries.getNames("ar", { select: "official" });

    // Convert the object to the format your SelectBox expects
    const allCountries = Object.entries(countryObj).map(([code, name]) => ({
        display: name,
        value: code.toLowerCase(),
    }));

    // Define your frequent countries
    const frequentCodes = ["sa", "eg", "in", "pk", "bd"];

    return [
        {
            groupLabel: "تستخدم بشكل متكرر",
            items: allCountries.filter(c => frequentCodes.includes(c.value)).reverse()
        },
        {
            groupLabel: "كل الجنسيات",
            // Sort alphabetically for better UX
            items: allCountries.sort((a, b) => a.display.localeCompare(b.display, "ar"))
        }
    ];
};
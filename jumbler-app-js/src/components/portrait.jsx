import React, { useState, useEffect } from "react";
import styles from "./portrait.module.css";
console.log("Styles object:", styles);

export default function Portrait({ alt }) {
    const [portraitFilename, setPortraitFilename] = useState(null);

    useEffect(() => {
        async function fetchManifest() {
            try {
                const response = await fetch("asset-manifest.json");
                if (!response.ok) throw new Error("Failed to load asset-manifest.json");
                const manifest = await response.json();
                setPortraitFilename(manifest.portrait);
            } catch (err) {
                console.error("Error loading manifest:", err);
            }
        }

        fetchManifest();
    }, []);

    return (
        <div className={styles.portrait}>
            {portraitFilename ? (
                <img src={portraitFilename} alt={alt} loading="eager" decoding="async" />
            ) : (
                <p>Loading portrait...</p>
            )}
        </div>
    );
}

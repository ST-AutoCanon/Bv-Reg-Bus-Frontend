export const barrel1 = [
    { value: "12", name: "12 - 12M Bus" },
    { value: "13", name: "13 - 13.5M Bus" },
    { value: "09", name: "09 - 9M Bus" },   
    { value: "06", name: "06 - 6M Bus" },
    { value: "77", name: "77 - Standard Part" },
];


// export const barrel1A = [
//     { value: "90", name: "90 - Sleeper" },
//     { value: "91", name: "91 - Hybrid" },
//     { value: "92", name: "92 - 2+2_Seater" },
//     { value: "93", name: "93 - 2+1_Seater" },
//     { value: "00", name: "00 - 00 Bus" },
// ];
export interface BarrelOption {
    value: string;
    name: string;
  }
export const barrel1A: Record<string, BarrelOption[]> = {
    "12": [      
        { value: "90", name: "90 - Sleeper" },
    { value: "91", name: "91 - Hybrid" },
    { value: "92", name: "92 - 2+2_Seater" },
    { value: "93", name: "93 - 2+1_Seater" },
    ],
    "13": [      
        { value: "90", name: "90 - Sleerer" },
    { value: "91", name: "91 - Hybrid" },
    { value: "92", name: "92 - 2+2_Seater" },
    { value: "93", name: "93 - 2+1_Seater" },
    ],
    "09": [      
        { value: "21", name: "21 - 2+1_Seater" },
            { value: "22", name: "22 - 2+2_Seater" },
    ],
    "06": [
        { value: "21", name: "21 - 2+1_Seater" },
        { value: "22", name: "22 - 2+2_Seater" },
    ],
    "77": [
        { value: "00", name: "00 - GI Tube" },
        { value: "11", name: "11 - MS Plate" },
        { value: "22", name: "22 - GI Sheet" },
        { value: "33", name: "33 - GI Profile" },
    ],
  };
  export function getBarrel1AOptions(selectedValue: string): BarrelOption[] {
    // Simply return options based on the selected value without filtering
    return barrel1A[selectedValue] || [];
}


  export const barrel2 = [
    { value: "00", name: "00 - Vehicle Release Group" },
    { value: "01", name: "01 - Front Structure" },
    { value: "02", name: "02 - Rear Structure" },
    { value: "03", name: "03 - Side Structure LH & RH" },
    { value: "04", name: "04 - Base Front & Middle STR" },
    { value: "05", name: "05 - Base STR (Upper Floor, Rear Floor, luggage STR)" },
    { value: "06", name: "06 - Roof STR" },
    { value: "07", name: "07 - Wheel Cover, Mud Guard Flap & Rubber Flap" },
    { value: "08", name: "08 - Battery Box & Other compartment" },
    { value: "09", name: "09 - Driver Door Assy(STR & Panneling)" },
    { value: "10", name: "10 - Emergency Door/Window (STR & Panneling)" },
    { value: "11", name: "11 - Passenger Door Assy" },
    { value: "12", name: "12 - Front Face, Grill Mech & Front Bumper" },
    { value: "13", name: "13 - Rear Face, Bumper" },
    { value: "14", name: "14 - Side Flaps (Battery Box, Fuel Tank, Coolant Tank)" },
    { value: "15", name: "15 - Driver Cabin Assy" },
    { value: "16", name: "16 - Roof Outer Panel" },
    { value: "17", name: "17 - Side Outer Panel" },
    { value: "18", name: "18 - Plywood, Inspection Lid, Vinyl" },
    { value: "19", name: "19 - Wheel Housing & Side Base Board" },
    { value: "20", name: "20 - Electrical Assys" },
    { value: "21", name: "21 - Insulation Assy" },
    { value: "22", name: "22 - Ladder Platform Assy & EXT Access" },
    { value: "23", name: "23 - Shell Assy Combination" },
    { value: "24", name: "24 - Chassis & Shell Joint" },
    { value: "25", name: "25 - AC & HVAC" },
    { value: "26", name: "26 - Hand Hold (Station pole, Grab Rail, Partition Assy)" },
    { value: "27", name: "27 - Dash Board Or Engine Hood Cover Assy" },
    { value: "28", name: "28 - Hatrack Or Roof Hatch Assy" },
    { value: "29", name: "29 - Window Guard Rail" },
    { value: "30", name: "30 - Door Finishing Cover Assy" },
    { value: "31", name: "31 - Side Inner Paneling" },
    { value: "32", name: "32 - Roof Inner Paneling" },
    { value: "33", name: "33 - External Trim's (ABS, Rain Gutter, Wheel Arch, Striker ext)" },
    { value: "34", name: "34 - Internal Trim's (Sunvisor, Sticker, ABS, Aluminum profiles)" },
    { value: "35", name: "35 - Seat Assy" },
    { value: "36", name: "36 - Safety (Fire EXT, First AID Box & Hammer Assy)" },
    { value: "37", name: "37 - Chessy Parts" },
    { value: "38", name: "38 - Window Assy" },
    { value: "39", name: "39 - Windshield Assy" },
    { value: "40", name: "40 - Paint/Consumables" },
    { value: "41", name: "41 - ARAI Drawings (Arai related Drawing Certificates)" },
    { value: "42", name: "42 - Offer Drawing Technical Specification" },
    { value: "43", name: "43 - Step Info Assy" },
    { value: "44", name: "44 - Front & Rear Flaps" },
    { value: "45", name: "45 - ORVM" },
    { value: "46", name: "46 - Wiper" },
    { value: "47", name: "47 - Window Pillar" },
    { value: "48", name: "48 - Chassis Preparation" },
    { value: "49", name: "49 - Destination Assy" },
];
export const barrel2Alternate00 = [
    { value: "01", name: "01 - 20X40_Cut 20 Side 1.20 mm" },
    { value: "02", name: "02 - 20X40_Cut 40 Side 1.20 mm" },
    { value: "03", name: "03 - 25X25 1.20 mm" },
    { value: "04", name: "04 - 30X40_Cut 40 Side 1.20 mm" },
    { value: "05", name: "05 - 30X40_Cut 30 Side 1.20 mm" },
    { value: "06", name: "06 - 30X30 1.20 mm" },
    { value: "07", name: "07 - 40X40 1.20 mm" },
    { value: "08", name: "08 - 40X50_Cut 40 Side 1.20 mm" },
    { value: "09", name: "09 - 40X50_Cut 50 Side 1.20 mm" },
    { value: "10", name: "10 - 40X60_Cut 40 Side 1.20 mm" },
    { value: "11", name: "11 - 40X60_Cut 60 Side 1.20 mm" },
    { value: "12", name: "12 - 20X40_Cut 20 Side 1.50 mm" },
    { value: "13", name: "13 - 20X40_Cut 40 Side 1.50 mm" },
    { value: "14", name: "14 - 25X25 1.50 mm" },
    { value: "15", name: "15 - 30X40_Cut 40 Side 1.50 mm" },
    { value: "16", name: "16 - 30X40_Cut 30 Side 1.50 mm" },
    { value: "17", name: "17 - 30X30 1.50 mm" },
    { value: "18", name: "18 - 40X40 1.50 mm" },
    { value: "19", name: "19 - 40X50_Cut 40 Side 1.50 mm" },
    { value: "20", name: "20 - 40X50_Cut 50 Side 1.50 mm" },
    { value: "21", name: "21 - 40X60_Cut 40 Side 1.50 mm" },
    { value: "22", name: "22 - 40X60_Cut 60 Side 1.50 mm" },
    { value: "23", name: "23 - 20X40_Cut 20 Side 2.00 mm" },
    { value: "24", name: "24 - 20X40_Cut 40 Side 2.00 mm" },
    { value: "25", name: "25 - 25X25 2.00 mm" },
    { value: "26", name: "26 - 30X40_Cut 40 Side 2.00 mm" },
    { value: "27", name: "27 - 30X40_Cut 30 Side 2.00 mm" },
    { value: "28", name: "28 - 30X30 2.00 mm" },
    { value: "29", name: "29 - 40X40 2.00 mm" },
    { value: "30", name: "30 - 40X50_Cut 40 Side 2.00 mm" },
    { value: "31", name: "31 - 40X50_Cut 50 Side 2.00 mm" },
    { value: "32", name: "32 - 40X60_Cut 40 Side 2.00 mm" },
    { value: "33", name: "33 - 40X60_Cut 60 Side 2.00 mm" },
    { value: "34", name: "34 - 20X40_Cut 20 Side 2.75 mm" },
    { value: "35", name: "35 - 20X40_Cut 40 Side 2.75 mm" },
    { value: "36", name: "36 - 25X25 2.75 mm" },
    { value: "37", name: "37 - 30X40_Cut 40 Side 2.75 mm" },
    { value: "38", name: "38 - 30X40_Cut 30 Side 2.75 mm" },
    { value: "39", name: "39 - 30X30 2.75 mm" },
    { value: "40", name: "40 - 40X40 2.75 mm" },
    { value: "41", name: "41 - 40X50_Cut 40 Side 2.75 mm" },
    { value: "42", name: "42 - 40X50_Cut 50 Side 2.75 mm" },
    { value: "43", name: "43 - 40X60_Cut 40 Side 2.75 mm" },
    { value: "44", name: "44 - 40X60_Cut 60 Side 2.75 mm" },
];
export const barrel2Alternate11 = [
    { value: "01", name: "01 - 3 mm Plate" },
    { value: "02", name: "02 - 3.75 mm Plate" },
    { value: "03", name: "03 - 4.25 mm Plate" }
];
export const barrel2Alternate33 = [
    { value: "01", name: "01 - 20X40_Cut 20 Side - 1.20 mm" },
    { value: "02", name: "02 - 20X40_Cut 40 Side - 1.20 mm" },
    { value: "03", name: "03 - 25X25 - 1.20 mm" },
    { value: "04", name: "04 - 30X40_Cut 40 Side - 1.20 mm" },
    { value: "05", name: "05 - 30X40_Cut 30 Side - 1.20 mm" },
    { value: "06", name: "06 - 30X30 - 1.20 mm" },
    { value: "07", name: "07 - 40X40 - 1.20 mm" },
    { value: "08", name: "08 - 40X50_Cut 40 Side - 1.20 mm" },
    { value: "09", name: "09 - 40X50_Cut 50 Side - 1.20 mm" },
    { value: "10", name: "10 - 40X60_Cut 40 Side - 1.20 mm" },
    { value: "11", name: "11 - 40X60_Cut 60 Side - 1.20 mm" },
    
    { value: "12", name: "12 - 20X40_Cut 20 Side - 1.50 mm" },
    { value: "13", name: "13 - 20X40_Cut 40 Side - 1.50 mm" },
    { value: "14", name: "14 - 25X25 - 1.50 mm" },
    { value: "15", name: "15 - 30X40_Cut 40 Side - 1.50 mm" },
    { value: "16", name: "16 - 30X40_Cut 30 Side - 1.50 mm" },
    { value: "17", name: "17 - 30X30 - 1.50 mm" },
    { value: "18", name: "18 - 40X40 - 1.50 mm" },
    { value: "19", name: "19 - 40X50_Cut 40 Side - 1.50 mm" },
    { value: "20", name: "20 - 40X50_Cut 50 Side - 1.50 mm" },
    { value: "21", name: "21 - 40X60_Cut 40 Side - 1.50 mm" },
    { value: "22", name: "22 - 40X60_Cut 60 Side - 1.50 mm" },
    
    { value: "23", name: "23 - 20X40_Cut 20 Side - 2.00 mm" },
    { value: "24", name: "24 - 20X40_Cut 40 Side - 2.00 mm" },
    { value: "25", name: "25 - 25X25 - 2.00 mm" },
    { value: "26", name: "26 - 30X40_Cut 40 Side - 2.00 mm" },
    { value: "27", name: "27 - 30X40_Cut 30 Side - 2.00 mm" },
    { value: "28", name: "28 - 30X30 - 2.00 mm" },
    { value: "29", name: "29 - 40X40 - 2.00 mm" },
    { value: "30", name: "30 - 40X50_Cut 40 Side - 2.00 mm" },
    { value: "31", name: "31 - 40X50_Cut 50 Side - 2.00 mm" },
    { value: "32", name: "32 - 40X60_Cut 40 Side - 2.00 mm" },
    { value: "33", name: "33 - 40X60_Cut 60 Side - 2.00 mm" },

    { value: "34", name: "34 - 20X40_Cut 20 Side - 2.75 mm" },
    { value: "35", name: "35 - 20X40_Cut 40 Side - 2.75 mm" },
    { value: "36", name: "36 - 25X25 - 2.75 mm" },
    { value: "37", name: "37 - 30X40_Cut 40 Side - 2.75 mm" },
    { value: "38", name: "38 - 30X40_Cut 30 Side - 2.75 mm" },
    { value: "39", name: "39 - 30X30 - 2.75 mm" },
    { value: "40", name: "40 - 40X40 - 2.75 mm" },
    { value: "41", name: "41 - 40X50_Cut 40 Side - 2.75 mm" },
    { value: "42", name: "42 - 40X50_Cut 50 Side - 2.75 mm" },
    { value: "43", name: "43 - 40X60_Cut 40 Side - 2.75 mm" },
    { value: "44", name: "44 - 40X60_Cut 60 Side - 2.75 mm" }
];
export function getBarrel2Options(selectedBarrel1AValue: string): { value: string; name: string }[] {
    // If the selected value in barrel1A is "00", return barrel2Alternate
    if (selectedBarrel1AValue === "00") {
        return barrel2Alternate00;
    }

    // If the selected value in barrel1A is "11", return barrel2Alternate1 (plate options)
    if (selectedBarrel1AValue === "11") {
        return barrel2Alternate11;
    }

    // If the selected value in barrel1A is "33", return barrel2Alternate33 (tube size options)
    if (selectedBarrel1AValue === "33") {
        return barrel2Alternate33;
    }

    // Otherwise, return the default barrel2 options
    return barrel2;
}


export const barrel3 = [
    { value: "00", name: "00 - Assembly" },
    { value: "01", name: "01 - RECT/SQ. MS/ GI Tube" },
    { value: "02", name: "02 - Round Tube" },
    { value: "03", name: "03 - M.S Solid Section" },
    { value: "04", name: "04 - GI/MS Plate/Sheet" },
    { value: "05", name: "05 - Al. Tube" },
    { value: "06", name: "06 - Al. Sheet" },
    { value: "07", name: "07 - Al. Extrusion" },
    { value: "08", name: "08 - Al. Glass" },
    { value: "09", name: "09 - Plywood" },
    { value: "10", name: "10 - FRP" },
    { value: "11", name: "11 - Rubber" },
    { value: "12", name: "12 - PVC/Plastic/Acrylic" },
    { value: "13", name: "13 - Casting" },
    { value: "14", name: "14 - ABS" },
    { value: "15", name: "15 - Vinyl" },
    { value: "16", name: "16 - Harness" },
    { value: "17", name: "17 - Electrical" },
    { value: "18", name: "18 - Electrical Schematic" },
    { value: "19", name: "19 - Stainless Steel Tube" },
    { value: "20", name: "20 - Stainless Steel Plate" },
    { value: "21", name: "21 - Stainless Steel" },
    { value: "22", name: "22 - Consumable" },
    { value: "23", name: "23 - Color Scheme" },
    { value: "24", name: "24 - Kit Part" },
    { value: "81", name: "81 - Propriatery Drawings" },
    { value: "82", name: "82 - Information Drawing" }
];
export const barrel3Alternate77 = [
    { value: "24", name: "24 - YST 240" },
    { value: "38", name: "38 - YST 380" },
    { value: "42", name: "42 - YST 420" },
    { value: "46", name: "46 - YST 460" },
    { value: "65", name: "65 - YST 650" },
    { value: "66", name: "66 - YST 660" }
];
export function getBarrel3Options(selectedBarrel1Value: string): { value: string; name: string }[] {
    // If the selected value in barrel1A is "77", return barrel3Alternate77
    if (selectedBarrel1Value === "77") {
        // console.log('selected barrel:77:',barrel3Alternate77)
        return barrel3Alternate77;
    }

    // Otherwise, return the default barrel3 options
    return barrel3;
}


export const barrel4 = [
    { value: "0", name: "0 - BUS" },
    { value: "1", name: "1 - Sub Bus Assy" },
    { value: "2", name: "2 - Group Assy" },
    { value: "3", name: "3 - Group Assy" },
    { value: "4", name: "4 - Group Assy" },
    { value: "5", name: "5 - Group Assy" }
];

export const barrel4Alternate77 = [
    { value: "3", name: "3 - Constant Number" },

];

export function getBarrel4Options(selectedBarrel1Value: string): { value: string; name: string }[] {
    // If the selected value in barrel1A is "77", return barrel3Alternate77
    if (selectedBarrel1Value === "77") {
        // console.log('selected barrel:77:',barrel4Alternate77)
        return barrel4Alternate77;
    }

    // Otherwise, return the default barrel3 options
    return barrel4;
}

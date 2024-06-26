
export interface Scenario {
    name: string;
    participation: number;
    reveilDeLaGauche: number;
    nfpRetreatIf3rd?: boolean;
    lremRetreatIf3rd?: boolean;
    groupement: Groupement[];
    'LREM vs Front Populaire': Groupement[];
    'RN vs LREM': Groupement[];
    'RN vs Front Populaire': Groupement[];
    'RN vs LREM vs Front Populaire': Groupement[];
    result: Result;
}

export interface Regroupement {
    name: string;
    ratio: number;

}

export interface Result {
    [key: string]: number;
}

export interface Groupement {
    name: string;
    regroupement: Regroupement[];
    vote?: number;
}
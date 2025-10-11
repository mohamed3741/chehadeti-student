import {IconNameType} from "../components/CustomIcon";

export interface ListMenuItem {
    icon: IconNameType;
    titleColor: string,
    title: string;
    link: string;
    disabled?: boolean;
}
export const MENU: {MENU1: ListMenuItem [], MENU2: ListMenuItem []} = {
    MENU1: [
        {
            icon: 'm-profile',
            title: 'Profile',
            link: 'ProfileScreen',
            titleColor: '#525252'
        },
        {
            icon: 'm-lock',
            title: 'Changer votre mot de passe',
            link: 'EditPasswordScreen',
            titleColor: '#525252'
        },
        {
            icon: 'm-lock',
            title: 'Changer votre numero de téléphone',
            link: 'EditUsernameScreen',
            titleColor: '#525252'
        },
        {
            icon: 'm-support',
            title: 'Payment',
            link: 'Payment',
            titleColor: '#525252'
        },
        {
            icon: 'm-support',
            title: 'Historique',
            link: 'WalletTransactions',
            titleColor: '#525252'
        },
        {
            icon: 'm-wallet',
            title: 'Wallet',
            link: 'WalletScreen',
            titleColor: '#525252',
            disabled: false
        },
        {
            icon: 'm-bell',
            title: 'Statistique',
            link: 'Statistique',
            titleColor: '#525252'
        },
        {
            icon: 'm-exclamation',
            title: 'À propos de nous',
            link: 'AboutUs',
            titleColor: '#525252'
        },
        {
            icon: 'm-language',
            title: 'Langue',
            link: 'LanguagesScreen',
            titleColor: '#525252'
        }
    ],
    MENU2: [
        {
            icon: 'm-lock',
            title: 'Support',
            link: 'Support',
            titleColor: '#525252'
        },
        {
            icon: 'm-logout',
            title: 'logout',
            link: "logout",
            titleColor: '#EA546A'
        },
    ]
};


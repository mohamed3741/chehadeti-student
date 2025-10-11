import * as Linking from 'expo-linking';

export default {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Root: {
                screens: {
                    TabOne: {
                        screens: {
                            TabOneScreen: 'one',
                        },
                    },
                    home: {
                        screens: {
                            TabHomeScreen: 'home',
                        },
                    },
                    order: {
                        screens: {
                            TabOrderScreen: 'order',
                        },
                    },
                    notification: {
                        screens: {
                            TabNotificationScreen: 'notification',
                        },
                    },
                    account: {
                        screens: {
                            TabAccountScreen: 'account',
                        },
                    },

                    TabTwo: {
                        screens: {
                            TabTwoScreen: 'two',
                        },
                    },
                },
            },
            Login: 'login',
            SignUp: 'signUp',
            NotFound: '*',
        },
    },
};

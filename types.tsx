
import {CourseDTO, ChapterDTO, SubsectionDTO, ContentDTO} from './models/LMS';

export type BottomTabParamList = {
    TabHome: undefined;
    TabSearch: undefined;
    TabFavorite: undefined;
    TabProfile: undefined;
    TabAccount: undefined;
    TabNotification: undefined;
    TabOrders: undefined;
};

export type TabHomeParamList = {
    TabHomeScreen: undefined;
    CourseDetail: {course: CourseDTO};
    ChapterDetail: {chapter: ChapterDTO};
    SubsectionContents: {subsection: SubsectionDTO};
    ContentViewer: {content: ContentDTO};
};

export type TabOrderParamList = {
    TabOrderScreen: undefined;
};
export type TabNotificationParamList = {
    TabNotificationScreen: undefined;
};
export type TabAccountParamList = {
    TabAccountScreen: undefined;
};

export type TabChatParamList = {
    TabChatScreen: undefined;
};

export type AuthStackParamList = {
    Auth: undefined;
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    Privacy: undefined;
    Terms: undefined;
    OnBoarding:undefined;
}

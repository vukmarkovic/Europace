import "./frame.css";

interface IProps {
    link: string;
}

/**
 * Represents blank page with iframe.
 * Used to display external resource content within the application.
 * @param link - URL.
 * @constructor
 */
export default function Frame({ link }: IProps) {
    return <iframe src={link} title="external" />;
}

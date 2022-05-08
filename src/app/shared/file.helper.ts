export function getName(path: string): string {
    let lastBackward = path.lastIndexOf('\\');
    let lastForward = path.lastIndexOf('/');
    let lastSlash = lastBackward > lastForward ? lastBackward : lastForward;
    return path.substring(lastSlash + 1);
}

export function getFolder(path: string): string {
    let lastBackward = path.lastIndexOf('\\');
    let lastForward = path.lastIndexOf('/');
    let lastSlash = lastBackward > lastForward ? lastBackward : lastForward;
    return path.substring(0, lastSlash + 1);
}
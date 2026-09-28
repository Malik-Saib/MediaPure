class UnsupportedVideo(Exception):
    """The upload is not a supported, well-formed video container."""


class VideoToolsMissing(Exception):
    """FFmpeg/FFprobe are not installed or not reachable on this host."""


class VideoProcessingError(Exception):
    """Cleaning ran but could not produce a file we are willing to hand over."""

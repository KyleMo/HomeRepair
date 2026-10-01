const PortalUnavailable = ({ error }: { error?: string }) => {
    return (
        <div>
            <h1>Portal unavailable</h1>
            <p>{error}</p>
        </div>
    );
};

export default PortalUnavailable;

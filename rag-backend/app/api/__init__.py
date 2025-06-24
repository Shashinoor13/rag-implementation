def register_routes(app):
    from .query import query_bp
    from .history import history_bp
    from .revalidate import revalidate_bp
    from .auth import auth_bp
    from .upload import upload_bp
    from flask import jsonify

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "ok"}), 200

    app.register_blueprint(query_bp, url_prefix="/api/query")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(revalidate_bp, url_prefix="/api/revalidate")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
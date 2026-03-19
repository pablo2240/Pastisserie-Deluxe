import { Link } from 'react-router-dom';
import { FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';

interface AuthRequiredMessageProps {
    title?: string;
    message?: string;
}

const AuthRequiredMessage: React.FC<AuthRequiredMessageProps> = ({
    title = "¡Ups! Acceso Restringido",
    message = "Para continuar, debes crear una cuenta o iniciar sesión"
}) => {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiLock className="text-amber-600 text-2xl" />
                </div>

                <h3 className="text-xl font-serif font-bold text-patisserie-dark mb-2">
                    {title}
                </h3>

                <p className="text-gray-500 mb-6">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 bg-patisserie-red text-white px-6 py-3 rounded-xl font-bold hover:bg-patisserie-red/90 transition-colors"
                    >
                        <FiLogIn />
                        Iniciar Sesión
                    </Link>

                    <Link
                        to="/registro"
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        <FiUserPlus />
                        Registrarse
                    </Link>
                </div>

                <p className="text-gray-400 text-xs mt-4">
                    Es rápido y sencillo. ¡Date un gusto con nosotros!
                </p>
            </div>
        </div>
    );
};

export default AuthRequiredMessage;

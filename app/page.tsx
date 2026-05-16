import { SubmitButton } from "./components/submit-button";
import IconSelector from "./components/icon-selector";
import Input from "./components/input";
import InteractiveCodeInput from "./components/interactive-code-input";
import { joinQuiz } from "./actions/quiz";
import { redirect} from "next/navigation";

/**
 * Página principal de la app. Muestra el formulario para que un jugador
 * ingrese el código del quiz, su nombre y su ícono antes de unirse.
 */
export default async function Home({searchParams}:{
  searchParams: Promise<{ code?: string; error?: string }>
}) {
  const { code, error } = await searchParams;
  async function logginQuiz(formData: FormData) {
    'use server';
    const quizCodeRaw = formData.get("quiz-code") as string;
    const username = formData.get("username") as string;
    const icon = formData.get("icon-selector") as string;

    if (!quizCodeRaw || !username || !icon) {
      return;
    }

    const code = parseInt(quizCodeRaw.replace('-', ''), 10);

    if (isNaN(code)) {
      return;
    }

    const result = await joinQuiz(code, username.trim(), icon);
    if (!result.success) {
      redirect(`/?error=${encodeURIComponent(result.error ?? 'Error al unirse al quiz')}${quizCodeRaw ? `&code=${code}` : ''}`);
    }
    if (result.success && result.slug) {
      redirect(`/quizz/${result.slug}`);
    }
  }

  return (
    <form
      action={logginQuiz}
      className="p-8 gap-4 flex flex-col justify-center items-center flex-1"
    >
      <h1 className="font-bold mb-8 text-accent text-2xl">Mondongo Quiz App</h1>

      {error && (
        <div className="w-full max-w-sm bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3 text-center">
          {decodeURIComponent(error)}
        </div>
      )}
      <InteractiveCodeInput initialValue={code ?? ""} />
      <Input name="username" placeholder='Tu nombre' />
      <IconSelector />
      <div className="h-full flex items-end">
        <SubmitButton loadingText="Entrando...">
          Entrar al quiz
        </SubmitButton>
      </div>
    </form>
  );
}

import { Component } from "react";

// Ловит ошибку загрузки отдельной части сайта (ленивый импорт, REL-02):
// вместо белого экрана — сообщение и «Повторить». Шапка и футер остаются.
// Отклонённый import() React кеширует, поэтому повтор — перезагрузка страницы.
export default class LoadErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Не удалось загрузить раздел:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section role="alert" className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold">Не получилось загрузить раздел</h1>
        <p className="mt-3 text-gray-600">
          Проверьте подключение к интернету и попробуйте ещё раз.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          Повторить
        </button>
      </section>
    );
  }
}

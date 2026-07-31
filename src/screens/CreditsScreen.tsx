import ScreenHeader from '../layout/ScreenHeader';
import Icon from '../components/Icon';
import styles from './CreditsScreen.module.css';

// Desde 31/07/2026 nenhuma capa é de terceiros, então não há mais atribuição
// obrigatória a exibir aqui. O histórico completo (o que havia antes e por que
// saiu) fica em CREDITOS.md, no repositório.
export default function CreditsScreen() {
  return (
    <>
      <ScreenHeader
        title="Créditos"
        back="/configuracoes"
        subtitle="De onde vêm os textos, as capas e a narração."
      />
      <div className={[styles.container, 'parent-area'].join(' ')}>
        <section className="card">
          <h2 className="section-title">
            <Icon name="book" size="var(--icon-md)" />
            Histórias
          </h2>
          <p className={styles.texto}>
            Os textos foram escritos para a Estante Encantada. Os contos clássicos (Chapeuzinho
            Vermelho, Cinderela, Cachinhos Dourados, João e o Pé de Feijão, O Patinho Feio e Os Três
            Porquinhos) são reescritas de obras em domínio público. Saci-Pererê, Curupira e a lenda
            da Vitória-Régia vêm do folclore brasileiro. O Sítio do Picapau Amarelo é inspirado na
            obra de Monteiro Lobato, em domínio público no Brasil desde 2019.
          </p>
        </section>

        <section className="card">
          <h2 className="section-title">
            <Icon name="brush" size="var(--icon-md)" />
            Capas
          </h2>
          <p className={styles.texto}>
            Todas as capas foram feitas para este projeto, assim como os ícones do aplicativo.
            Nenhuma imagem de terceiros é usada na estante.
          </p>
        </section>

        <section className="card">
          <h2 className="section-title">
            <Icon name="mic" size="var(--icon-md)" />
            Narração
          </h2>
          <p className={styles.texto}>
            As vozes são geradas pelo Google Cloud Text-to-Speech a partir dos textos daqui.
          </p>
        </section>
      </div>
    </>
  );
}

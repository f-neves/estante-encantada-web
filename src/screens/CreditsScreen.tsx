import ScreenHeader from '../layout/ScreenHeader';
import Icon from '../components/Icon';
import styles from './CreditsScreen.module.css';

interface Credito {
  livro: string;
  autor: string;
  licenca: string;
  url: string;
}

// As duas imagens sob Creative Commons exigem atribuição; as de domínio público
// aparecem por cortesia. A lista completa está em CREDITOS.md, no repositório.
const CC: Credito[] = [
  {
    livro: 'Cinderela',
    autor: 'Digitalização da MCAD Library (coleção Jack Zipes), ilustração de Oskar Herrfurth',
    licenca: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Cinderella_-_Jack_Zipes_Historic_Fairy_Tale_Postcard_Collection_-_Herrfurth,_Oskar_(German,_1862-1934).jpg',
  },
  {
    livro: 'A Lenda da Vitória-Régia',
    autor: 'Fotografia de Bilby',
    licenca: 'CC BY 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Victoria_amazonica_03.jpg',
  },
];

const PUBLICO: Credito[] = [
  {
    livro: 'Chapeuzinho Vermelho',
    autor: 'Otto Kubel (1868-1951)',
    licenca: 'domínio público',
    url: 'https://commons.wikimedia.org/wiki/File:Little_Red_Riding_Hood_Otto_Kubel.jpg',
  },
  {
    livro: 'Cachinhos Dourados e os Três Ursos',
    autor: 'Jessie Willcox Smith (1863-1935)',
    licenca: 'domínio público',
    url: "https://commons.wikimedia.org/wiki/File:Jessie_Willcox_Smith_-_'Goldilocks_and_the_Three_Bears',_Swift's_Premium_Soap_Products_calendar_illustration.jpg",
  },
  {
    livro: 'O Patinho Feio',
    autor: 'Milo Winter (1888-1956)',
    licenca: 'domínio público',
    url: 'https://commons.wikimedia.org/wiki/File:The_Ugly_Duckling_cropped.jpg',
  },
  {
    livro: 'João e o Pé de Feijão',
    autor: 'Arthur Rackham (1867-1939)',
    licenca: 'domínio público',
    url: 'https://commons.wikimedia.org/wiki/File:Jack_and_the_Beanstalk_Giant_-_Project_Gutenberg_eText_17034.jpg',
  },
];

function Lista({ itens }: { itens: Credito[] }) {
  return (
    <ul className={styles.lista}>
      {itens.map((c) => (
        <li key={c.livro} className={styles.item}>
          <span className={styles.livro}>{c.livro}</span>
          <span className={styles.autor}>{c.autor}</span>
          <a className={styles.link} href={c.url} target="_blank" rel="noreferrer">
            {c.licenca}
            <Icon name="chevron-forward" size="var(--icon-sm)" />
          </a>
        </li>
      ))}
    </ul>
  );
}

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

        <h2 className="section-label">Capas sob Creative Commons</h2>
        <div className="card">
          <Lista itens={CC} />
        </div>

        <h2 className="section-label">Capas em domínio público</h2>
        <div className="card">
          <Lista itens={PUBLICO} />
        </div>

        <h2 className="section-label">Arte própria</h2>
        <div className="card">
          <p className={styles.texto}>
            As capas de O Saci-Pererê, O Curupira, Sítio do Picapau Amarelo e O Dragão que Não Sabia
            Voar, além dos ícones do app, foram feitas para este projeto. A narração é gerada pelo
            Google Cloud Text-to-Speech a partir dos textos daqui.
          </p>
        </div>
      </div>
    </>
  );
}

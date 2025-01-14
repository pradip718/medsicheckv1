import useLoaderStore from '../../store/loaderStore';

const useFullPageLoader = () => {
  const {visible, setVisibility} = useLoaderStore();

  const showLoader = () => setVisibility(true);
  const hideLoader = () => setVisibility(false);

  return {visible, showLoader, hideLoader};
};

export default useFullPageLoader;
